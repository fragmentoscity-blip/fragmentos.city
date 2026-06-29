-- ============================================================
-- FRAGMENTOS.CITY - ESQUEMA COMPLETO SUPABASE
-- ============================================================
--
-- Uso recomendado para una base limpia:
-- 1. Borra las tablas existentes de public si quieres empezar desde cero.
-- 2. En Supabase Dashboard, ve a Authentication > Users y crea el usuario admin.
-- 3. Cambia ADMIN_EMAIL en este archivo por el correo exacto del usuario Auth.
-- 4. Ejecuta este archivo completo en SQL Editor.
-- 5. En Storage, confirma que el bucket "media" exista y sea publico.
--
-- La app ya NO usa contrasenas guardadas en public.users.
-- Supabase Auth valida email/contrasena. public.users solo guarda permisos admin.

-- ============================================================
-- EXTENSIONES
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- USUARIOS ADMIN VINCULADOS A SUPABASE AUTH
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  username TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_admin_self_read" ON public.users;
CREATE POLICY "users_admin_self_read" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id AND is_admin = true);

-- Cambia este correo por el email exacto que creaste en Authentication > Users.
-- Si todavia no creaste ese usuario Auth, este INSERT no insertara nada.
WITH admin_auth_user AS (
  SELECT id, lower(email) AS email
  FROM auth.users
  WHERE lower(email) = lower('fragmentoscity@gmail.com')
  LIMIT 1
)
INSERT INTO public.users (username, email, auth_user_id, is_admin, updated_at)
SELECT
  email,
  email,
  id,
  true,
  now()
FROM admin_auth_user
ON CONFLICT (username) DO UPDATE
SET
  email = EXCLUDED.email,
  auth_user_id = EXCLUDED.auth_user_id,
  is_admin = true,
  updated_at = now();

-- ============================================================
-- FUNCION PARA VALIDAR ADMIN
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE auth_user_id = auth.uid()
      AND is_admin = true
  );
$$;

-- ============================================================
-- PRODUCTOS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  "basePrice" NUMERIC NOT NULL,
  "originalPrice" NUMERIC,
  "discountPercent" INTEGER,
  image TEXT NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL,
  details JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "products_admin_write" ON public.products;
CREATE POLICY "products_admin_write" ON public.products
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- ORDENES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  items JSONB NOT NULL,
  shipping JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  "shippingCost" NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  "paymentMethod" TEXT NOT NULL DEFAULT 'wompi',
  "paymentReference" TEXT,
  "wompiTransactionId" TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TEXT NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'paid', 'processing', 'shipped'))
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_public_insert" ON public.orders;
CREATE POLICY "orders_public_insert" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "orders_admin_read" ON public.orders;
CREATE POLICY "orders_admin_read" ON public.orders
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;
CREATE POLICY "orders_admin_update" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- CONFIGURACION DEL SITIO
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_active BOOLEAN DEFAULT true NOT NULL,
  construction_mode BOOLEAN DEFAULT false NOT NULL,
  construction_title TEXT DEFAULT 'Proximamente' NOT NULL,
  construction_subtitle TEXT DEFAULT 'Algo extraordinario esta en camino',
  construction_message TEXT DEFAULT 'Estamos trabajando para ofrecerte la mejor experiencia.',
  construction_open_date TEXT DEFAULT '',
  construction_logo TEXT DEFAULT '',
  construction_bg_image TEXT DEFAULT '',
  construction_email TEXT DEFAULT '',
  construction_socials JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT site_settings_single_row CHECK (id = 1)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "site_settings_admin_write" ON public.site_settings;
CREATE POLICY "site_settings_admin_write" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO public.site_settings (
  id,
  site_active,
  construction_mode,
  construction_title,
  construction_subtitle,
  construction_message,
  construction_open_date,
  construction_logo,
  construction_bg_image,
  construction_email,
  construction_socials
)
VALUES (
  1,
  true,
  false,
  'Proximamente',
  'Algo extraordinario esta en camino',
  'Estamos trabajando para ofrecerte la mejor experiencia.',
  '',
  '',
  '',
  '',
  '{}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE: BUCKET MEDIA
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
CREATE POLICY "media_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media_admin_insert" ON storage.objects;
CREATE POLICY "media_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "media_admin_update" ON storage.objects;
CREATE POLICY "media_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.is_admin())
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "media_admin_delete" ON storage.objects;
CREATE POLICY "media_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.is_admin());

-- ============================================================
-- DATOS INICIALES
-- ============================================================

INSERT INTO public.products (id, name, description, "basePrice", "originalPrice", "discountPercent", image, stock, details)
VALUES
  (
    'frag_bog',
    'Fragmento Bogota',
    'La joya de la sabana. Un relieve sofisticado que expone el contraste unico entre el denso trazado urbano de la capital colombiana y la majestuosa cordillera de los Cerros Orientales.',
    159000,
    NULL,
    NULL,
    '/src/assets/images/bogota_3d_frame_1781095869593.png',
    5,
    '{"lat":4.6097,"lng":-74.0817,"zoom":13.5}'::jsonb
  ),
  (
    'frag_par',
    'Fragmento Paris',
    'L Etoile et la Seine. Captura los bulevares de la Place de l Etoile y las curvas del Rio Sena en un relieve tridimensional impecable.',
    159000,
    NULL,
    NULL,
    '/src/assets/images/paris_3d_frame_1781095885040.png',
    3,
    '{"lat":48.8566,"lng":2.3522,"zoom":13.8}'::jsonb
  ),
  (
    'frag_bar',
    'Fragmento Barcelona',
    'La utopia geometrica de Ildefons Cerda. Un cuadro que retrata la cuadricula octogonal del Eixample cruzada por la Avenida Diagonal.',
    159000,
    NULL,
    NULL,
    '/src/assets/images/barcelona_3d_frame_1781095898025.png',
    0,
    '{"lat":41.3851,"lng":2.1734,"zoom":14.1}'::jsonb
  ),
  (
    'frag_med',
    'Fragmento Medellin',
    'Un relieve tridimensional que captura las laderas del Valle de Aburra, el cauce del Rio Medellin y los desniveles topograficos de sus cerros.',
    159000,
    182750,
    13,
    '/src/assets/images/bogota_3d_frame_1781095869593.png',
    4,
    '{"lat":6.2442,"lng":-75.5812,"zoom":13.5}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

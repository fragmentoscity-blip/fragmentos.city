-- ==========================================
-- SCHEMA DE CONFIGURACIÓN PARA SUPABASE
-- Fragmentos.city E-commerce
-- Copia y pega esto en el editor SQL de Supabase
-- ==========================================

-- 1. Crear tabla de Productos (Relieves Predefinidos)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    "basePrice" NUMERIC NOT NULL,
    image TEXT NOT NULL,
    stock INTEGER DEFAULT 5,
    details JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Habilitar acceso de lectura público en la tabla products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura pública de productos" ON public.products
    FOR SELECT TO public USING (true);
CREATE POLICY "Permitir escrituras a administradores o todos para prototipo" ON public.products
    FOR ALL TO public USING (true);


-- 2. Crear tabla de Órdenes (Pedidos Hechos por Coleccionistas)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    items JSONB NOT NULL,
    shipping JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    "shippingCost" NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentReference" TEXT,
    "wompiTransactionId" TEXT,
    status TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS "paymentReference" TEXT,
    ADD COLUMN IF NOT EXISTS "wompiTransactionId" TEXT;

-- Habilitar acceso público o autenticado en la tabla orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura de órdenes para prototipo" ON public.orders
    FOR SELECT TO public USING (true);
CREATE POLICY "Permitir inserción de órdenes para prototipo" ON public.orders
    FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permitir actualización de órdenes para prototipo" ON public.orders
    FOR UPDATE TO public USING (true);


-- 3. Crear tabla de Credenciales/Perfiles (Autenticación de Coleccionistas y Admins)
CREATE TABLE IF NOT EXISTS public.users (
    username TEXT PRIMARY KEY,
    email TEXT,
    password TEXT,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    full_name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    document_id TEXT DEFAULT '',
    department TEXT DEFAULT '',
    city TEXT DEFAULT '',
    address TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS document_id TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS department TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Habilitar RLS en users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura pública/autenticada de usuarios" ON public.users
    FOR SELECT TO public USING (true);
CREATE POLICY "Permitir inserción pública de usuarios (registro)" ON public.users
    FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permitir actualizaciones a todos los campos en prototipo" ON public.users
    FOR ALL TO public USING (true);

-- Sembrar credenciales iniciales por defecto si no existen
INSERT INTO public.users (username, email, password, is_admin)
VALUES 
    ('admin', 'admin@fragmentos.local', 'admin123', true),
    ('daniel', 'daniel@fragmentos.local', 'daniel123', false)
ON CONFLICT (username) DO NOTHING;


-- ==========================================
-- CONFIGURACIÓN DEL STORAGE (CUBO S3)
-- ==========================================
-- 1. Ve a "Storage" en tu panel lateral de Supabase.
-- 2. Haz clic en "New Bucket".
-- 3. Nómbralo: "media".
-- 4. Activa la opción "Public" (para que cualquiera pueda acceder a las URLs de imágenes y videos).
-- 5. Haz clic en "Save".
-- 6. En la pestaña "Policies" de Storage, asegúrate de añadir una regla para permitir lecturas y escrituras públicas si deseas que los uploads funcionen sin autenticación rigurosa.

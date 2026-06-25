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
    status TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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
    password TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura pública/autenticada de usuarios" ON public.users
    FOR SELECT TO public USING (true);
CREATE POLICY "Permitir inserción pública de usuarios (registro)" ON public.users
    FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permitir actualizaciones a todos los campos en prototipo" ON public.users
    FOR ALL TO public USING (true);

-- Sembrar credenciales iniciales por defecto si no existen
INSERT INTO public.users (username, password, is_admin)
VALUES 
    ('admin', 'admin123', true),
    ('daniel', 'daniel123', false)
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

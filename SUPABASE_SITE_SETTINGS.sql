-- ==========================================
-- CONFIGURACION GLOBAL DEL SITIO
-- Fragmentos.city - modo construccion
-- ==========================================
-- Ejecuta este script en el SQL Editor de Supabase.

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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT site_settings_single_row CHECK (id = 1)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura publica de configuracion del sitio" ON public.site_settings;
CREATE POLICY "Permitir lectura publica de configuracion del sitio" ON public.site_settings
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Permitir escritura de configuracion para prototipo" ON public.site_settings;
CREATE POLICY "Permitir escritura de configuracion para prototipo" ON public.site_settings
    FOR ALL TO public USING (true) WITH CHECK (true);

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

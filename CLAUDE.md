# Fragmentos City — CLAUDE.md

## Visión General
E-commerce de cuadros 3D topográficos de ciudades colombianas. El usuario elige una ciudad del catálogo o configura su propia coordenada en el mapa Leaflet, y recibe un relieve impreso en PLA bioplástico.

## Stack Técnico
- **React 19** + **Vite 6** + **TypeScript 5.8**
- **Tailwind CSS v4** (via `@tailwindcss/vite`, tokens en `src/index.css`)
- **Supabase** (PostgreSQL + Storage S3)
- **Leaflet** (mapa interactivo en MapConfigurator)
- **motion/react** (animaciones)
- **lucide-react** (iconografía)

## Estructura del Proyecto
```
src/
├── App.tsx                    # Shell global, estado central, routing por estado
├── main.tsx                   # Entry point (React 19 StrictMode)
├── index.css                  # Tailwind v4, tokens de marca, Leaflet overrides
├── types.ts                   # Todos los tipos TypeScript del dominio
├── lib/
│   └── supabaseClient.ts      # Cliente Supabase + todas las queries
└── components/
    ├── AdminDashboard.tsx     # Shell del panel CMS (tabs: Sitio/Contenido/Multimedia/Órdenes)
    ├── admin/                 # Sub-componentes del CMS
    │   ├── SitePanel.tsx      # Administración del sitio + modo construcción
    │   ├── ConstructionSettings.tsx  # Config detallada del modo construcción
    │   ├── ContentManager.tsx # CRUD de contenido/productos
    │   ├── ContentCard.tsx    # Tarjeta expandible de cada ítem
    │   ├── ContentEditor.tsx  # Editor con 7 pestañas
    │   ├── MediaLibrary.tsx   # Biblioteca multimedia centralizada
    │   └── AdminButtons.tsx   # Botones globales reutilizables
    ├── Catalog.tsx            # Grilla de productos + modal de variantes
    ├── Cart.tsx               # Drawer lateral carrito
    ├── Checkout.tsx           # Formulario de pago/envío Colombia
    ├── Hero.tsx               # Slider hero
    ├── MapConfigurator.tsx    # Mapa Leaflet interactivo
    ├── Navbar.tsx             # Navegación fija
    └── ...otros componentes
```

## Routing
No usa React Router. El routing es por estado en `App.tsx`:
```typescript
const [currentView, setCurrentView] = useState<"store" | "checkout" | "success" | "payments_plan" | "admin">("store");
```
El acceso a `"admin"` requiere `currentUser.isAdmin === true`.

## Supabase — Tablas
| Tabla | Descripción |
|---|---|
| `products` | Catálogo de productos (CRUD completo) |
| `orders` | Pedidos de clientes |
| `users` | Perfiles admin vinculados a Supabase Auth (`auth_user_id`, `is_admin`) |
| `site_settings` | Configuración global del sitio (fila única id=1) |

## Supabase — Storage
- Bucket: `media` (público, 50MB max)
- Path: `uploads/{random}_{timestamp}.{ext}`
- Función: `uploadToSupabaseStorage(file, "media")`

## Variables de Entorno
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Tokens de Color (Tailwind v4)
```css
--color-brand-navy:       #243746
--color-brand-sand:       #DBD6D1
--color-brand-gray:       #BDBDBD
--color-brand-terracotta: #A57051
```
Usarlos como: `bg-brand-navy`, `text-brand-terracotta`, etc.

## Autenticación Admin
- Supabase Auth valida email y contraseña.
- `public.users.auth_user_id` vincula el usuario Auth con permisos admin.
- `currentUser.isAdmin === true` habilita el acceso.
- El admin accede desde el botón `Colaboradores`.

## Comandos
```bash
npm run dev      # Dev server en puerto 3000
npm run build    # Build de producción (output: dist/)
npm run lint     # TypeScript check
```

## Patrones Importantes
- **Estado global**: Todo en `useState` en `App.tsx`, pasado por props (sin Context ni Zustand)
- **Fallback de datos**: Si Supabase falla, se usa `localStorage` como respaldo
- **Imágenes**: Subir a Supabase Storage; fallback a base64 si falla
- **Modo Construcción**: `constructionMode` en localStorage + Supabase `site_settings`
- **Tailwind v4**: Sin archivo `tailwind.config.js`, los tokens van en `index.css`

## SQL — Tabla site_settings
```sql
CREATE TABLE site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_active BOOLEAN DEFAULT true,
  construction_mode BOOLEAN DEFAULT false,
  construction_title TEXT DEFAULT 'Próximamente',
  construction_subtitle TEXT DEFAULT '',
  construction_message TEXT DEFAULT '',
  construction_open_date TEXT DEFAULT '',
  construction_logo TEXT DEFAULT '',
  construction_bg_image TEXT DEFAULT '',
  construction_email TEXT DEFAULT '',
  construction_socials JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
```

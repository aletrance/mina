# MineFleet 🏗️⛏️

Sistema de gestión de vehículos para operaciones mineras. Aplicación multi-tenant con control de flotas, asignaciones y calendario.

## Tech Stack

- **Frontend**: React 19 + Vite
- **Estilos**: CSS custom (dark industrial theme)
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **Calendario**: react-big-calendar + date-fns
- **Iconos**: Lucide React
- **Notificaciones**: react-hot-toast

## Características

- 🔐 Autenticación con roles (Super Admin / Admin)
- 🏢 Multi-tenant: cada empresa ve solo sus datos
- 🚛 CRUD de vehículos (auto, camioneta, camión)
- 📅 Asignaciones con detección de solapamiento
- 📆 Calendario visual con colores por tipo de vehículo
- 🛡️ Row Level Security en todas las tablas

## Requisitos

- Node.js 18+
- Proyecto en [Supabase](https://supabase.com)

## Setup

### 1. Clonar e instalar

```bash
git clone https://github.com/tu-usuario/minefleet.git
cd minefleet
npm install
```

### 2. Configurar Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com)
2. Abrí el **SQL Editor** y ejecutá el archivo `supabase/schema.sql`
3. Copiá `.env.example` a `.env` y completá tus credenciales:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Crear usuario de prueba

En el dashboard de Supabase:
1. Ve a **Authentication** → **Users** → **Add User**
2. Creá un usuario con email y contraseña
3. En el **SQL Editor**, insertá el perfil:

```sql
INSERT INTO users (id, email, full_name, role)
VALUES (
  'UUID-del-usuario-creado',
  'tu@email.com',
  'Tu Nombre',
  'super_admin'
);
```

### 4. Ejecutar

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`

## Estructura del Proyecto

```
src/
├── components/
│   ├── layout/        (AppShell, ProtectedRoute)
│   └── vehicles/      (AddVehicleDialog)
├── context/           (AuthContext)
├── hooks/             (useVehicles, useAssignments, useTenants)
├── lib/               (supabase, utils)
├── pages/             (Login, Dashboard, Vehicles, Calendar, etc.)
└── index.css          (Design system completo)
```

## Licencia

MIT

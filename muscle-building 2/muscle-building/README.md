# Muscle Building 💪

Plataforma SaaS para la administración integral de gimnasios. React 19 + TypeScript + Vite + Tailwind CSS + Supabase.

## Instalación

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Eso es todo — **no necesitas configurar nada más para probar la app**, ya que corre en **modo demo** por defecto (ver abajo).

## Modo demo (activo por defecto)

Mientras no configures las variables de Supabase, la app guarda todos los datos en `localStorage` del navegador, con la misma forma de datos que tendría en Supabase. Esto significa que **registro, inicio de sesión, miembros, rutinas, pagos, clases y asistencia funcionan de verdad**, sin backend externo — ideal para pruebas, demos o sustentaciones.

Cuentas de prueba ya cargadas (o crea la tuya propia desde "Regístrate"):

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@musclebuilding.app` | `admin123` |
| Entrenador | `entrenador@musclebuilding.app` | `entrenador123` |

Para reiniciar los datos de demo, borra la clave `muscle-building-demo-db-v1` del localStorage del navegador (DevTools → Application → Local Storage).

## Conectar Supabase (backend real)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En el **SQL Editor** de tu proyecto, ejecuta el script `supabase/schema.sql` incluido en este repositorio — crea todas las tablas, relaciones, índices y políticas RLS.
3. Copia `.env.example` a `.env` y coloca tu URL y anon key:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
   ```
4. Reinicia `npm run dev`. La app detecta las variables automáticamente y las funciones de autenticación (`src/lib/db.ts` → `registerUser`, `loginUser`, etc.) empiezan a usar Supabase Auth real en lugar del modo demo.
5. Los módulos de datos (miembros, pagos, rutinas, etc.) están en `src/lib/db.ts`, escritos para que cada función se reemplace por su consulta equivalente de `supabase.from(...)` sin tocar el resto de la app — los tipos y las firmas ya coinciden con el esquema SQL.

## Estructura del proyecto

```
src/
  components/ui/       Componentes base reutilizables (Button, Input, Modal, Badge…)
  components/layout/   Sidebar, Topbar, layout del dashboard, rutas protegidas
  context/              AuthContext (sesión y perfil del usuario)
  data/                 Datos semilla: ejercicios y rutinas
  features/
    auth/                Login, Registro, Recuperar contraseña
    dashboard/           KPIs y resumen general
    members/             Gestión de miembros (CRUD)
    attendance/          Control de asistencia
    routines/            Rutinas y biblioteca de ejercicios
    classes/             Clases grupales y reservas
    payments/            Pagos e historial
    settings/            Configuración del gimnasio
  lib/                   Cliente de Supabase, capa de datos, utilidades
  routes/                Definición de rutas (React Router)
  types/                 Tipos de dominio compartidos
supabase/
  schema.sql             Esquema completo listo para producción
```

## Despliegue a un dominio propio

Cualquier hosting de sitios estáticos sirve (Vercel, Netlify, Cloudflare Pages):

```bash
npm run build
```

Esto genera la carpeta `dist/` — súbela al hosting que elijas y apunta tu dominio ahí. Si conectaste Supabase, agrega las mismas variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) en la configuración del hosting.

## Alcance de este prototipo

Este proyecto cubre a propósito los módulos centrales (auth, dashboard, miembros, asistencia, rutinas/ejercicios detallados, clases, pagos, configuración) de forma completamente funcional. Módulos adicionales del brief original (inventario, ventas, reportes exportables a PDF/Excel) no están incluidos en esta entrega, pero el esquema SQL y la arquitectura ya están preparados para agregarlos siguiendo el mismo patrón que los módulos existentes.

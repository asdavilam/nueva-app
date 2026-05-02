# Burger Business Blueprint (MVP)

Aplicación full stack enfocada en guía administrativa y estratégica para negocios de hamburguesas, sin duplicar módulos de recetas/costeo/operación técnica.

## Incluye en este MVP

- Dashboard ejecutivo con progreso general
- Sistema Base del Negocio (checklist 21 días)
- KPIs simples de captura manual
- Plantillas administrativas
- Roadmap de crecimiento de 7 fases
- Base para gamificación
- Esquema SQL para Supabase (Auth + PostgreSQL + RLS)

## Stack

- Next.js (App Router) + TypeScript
- TailwindCSS
- Supabase (Auth + DB)
- Vercel ready

## Configuración local

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env.local` a partir de `.env.example` y completar:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Ejecutar desarrollo:

```bash
npm run dev
```

4. Abrir `http://localhost:3000`

## Supabase

1. Crear proyecto en Supabase.
2. Ejecutar SQL de [`/Users/aletz/Documents/New project/supabase/schema.sql`](/Users/aletz/Documents/New%20project/supabase/schema.sql).
3. Ejecutar SQL de [`/Users/aletz/Documents/New project/supabase/operational_upgrade.sql`](/Users/aletz/Documents/New%20project/supabase/operational_upgrade.sql).
3. Activar proveedores de Auth que necesites.

## Funcionalidad operativa actual

- Login por correo + contraseña (con opción de registro)
- Checklist 21 días persistente por usuario
- Estado de tareas, checkbox, fecha y notas guardados en `task_progress`
- Registro rápido manual de ventas/gastos (`finance_entries`)
- KPI mensual manual (`kpis`) con ticket promedio y margen estimado
- Bitácora rápida (`notes`)
- Plantillas administrativas editables y guardables
- Próxima tarea recomendada automática
- Exportación de resumen final en JSON
- Navbar mobile funcional por secciones

## Ajuste recomendado en Supabase Auth

Para evitar dependencia de correo al crear cuentas, en Supabase revisa:

- `Authentication -> Providers -> Email`
- Si quieres flujo inmediato personal, desactiva `Confirm email` (solo si te conviene en uso privado).

## Deploy Netlify

1. Conecta repositorio en Netlify.
2. Build command: `npm run build`
3. Variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

> Nota: este proyecto ya incluye `netlify.toml` con `@netlify/plugin-nextjs`.

## Nota de alcance

Esta app está diseñada como cerebro administrativo (estrategia, orden, crecimiento, indicadores), no como sistema de recetas/cocina/costeo técnico.

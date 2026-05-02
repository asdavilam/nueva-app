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
2. Ejecutar SQL de `/supabase/schema.sql`.
3. Activar proveedores de Auth que necesites.

## Deploy Vercel

1. Conecta repositorio en Vercel.
2. Configura variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy.

## Nota de alcance

Esta app está diseñada como cerebro administrativo (estrategia, orden, crecimiento, indicadores), no como sistema de recetas/cocina/costeo técnico.

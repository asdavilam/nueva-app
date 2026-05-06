# Burger Business Blueprint — CLAUDE.md

## Project

**Burger Business Blueprint** — cerebro administrativo para dueños de hamburgueserías/restaurantes pequeños. Guía estratégica, no operativa. Existe otra app separada para recetas, costeo y operaciones internas. NO duplicar esas funciones.

Stack: Next.js 15 (App Router) · TypeScript · TailwindCSS · Supabase (Auth + PostgreSQL) · Vercel deploy.

## Architecture

**Target:** feature-based routing, not single page.

```
src/
  app/
    (auth)/login/page.tsx
    (app)/layout.tsx          ← sidebar + shell
    (app)/dashboard/page.tsx
    (app)/checklist/page.tsx
    (app)/ventas/page.tsx     ← finance entries + product sales
    (app)/productos/page.tsx  ← product catalog + variants
    (app)/kpis/page.tsx
    (app)/roadmap/page.tsx
    (app)/plantillas/page.tsx
    (app)/logros/page.tsx
  components/
    ui/                       ← shared primitives
    layout/                   ← sidebar, mobile nav
    checklist/
    ventas/
    productos/
    kpis/
  lib/
    supabase.ts
    types.ts
    data.ts                   ← static catalog (checklist tasks, phases, templates)
    app-data.ts               ← DB hydration helpers
```

**Current state:** everything in `src/app/page.tsx` (single file). Needs refactor into above structure.

## DB Schema (Supabase)

Core tables: `business_profiles`, `tasks`, `task_progress`, `notes`, `finance_entries`, `kpis`, `phases`, `phase_tasks`, `templates`.

**Pending tables to add:**
- `products` — catalog of products (name, category, price, active)
- `product_variants` — size/combos per product (name, price_adjustment)
- `sale_items` — line items linking finance_entries → product + variant + qty

All user tables use RLS `auth.uid() = user_id`.

## Key Rules

1. **No duplicate functionality** — no recipe creation, no technical costing, no inventory management (those live in the other app).
2. **Simple UX** — target user is non-technical restaurant owner. No complex flows.
3. **Finance entries stay simple** — manual input: type (venta/gasto), amount, category, date, optional note.
4. **Products module = lightweight POS-like catalog** — create products + variants, log sales by product to derive best sellers + ticket promedio. NOT a full POS.
5. **7 phases in roadmap** — Fase 1–6 + Fase Extra (cadena fuerte). Never collapse or remove.
6. **Spanish UI** — all labels, messages, and copy in Spanish.
7. **Dark theme only** — `className="dark"` on html element, bg-background slate palette.

## Coding Conventions

- `"use client"` only on components that need it (hooks/events). Server components by default in App Router.
- Tailwind only — no CSS modules, no styled-components.
- No shadcn/ui yet unless explicitly added. Use existing panelSoft/accent/muted custom colors from tailwind.config.ts.
- Async DB calls go in server components or dedicated lib helpers — not inline in JSX.
- Types live in `src/lib/types.ts`. Static data in `src/lib/data.ts`.

## Current Tailwind Custom Colors

```ts
// tailwind.config.ts
background: slate-950
panel: slate-900
panelSoft: slate-800
accent: orange-500 / amber-500 area
muted: slate-400
```

## What NOT to build

- Recipe creator
- Food cost calculator
- Full inventory system
- Complex POS with printers/receipts
- Employee scheduling
- Loyalty programs (Phase 3+ scope)

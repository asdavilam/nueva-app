# Product Definition — Burger Business Blueprint

## Vision

Ayudar a dueños de hamburgueserías/restaurantes pequeños a profesionalizar su negocio paso a paso. Esta app es el **cerebro administrativo**. La guía estratégica, el control financiero básico y el roadmap hacia franquicia.

**No es:** app de recetas, costeo, inventario técnico ni POS completo.

---

## Target User

Dueño de hamburguesería pequeña/familiar. No técnico. Quiere saber:
- ¿Cuánto vendí y cuánto gasté?
- ¿Qué productos se venden más?
- ¿Cómo va mi negocio?
- ¿Qué sigue para crecer?

---

## Módulos

### 1. Dashboard

Vista ejecutiva al entrar. Muestra:
- % completado del Sistema Base 21 días
- Ventas del mes actual
- Gastos del mes actual
- Utilidad estimada (ventas - gastos)
- Salud del negocio (score 0–100)
- Próxima tarea recomendada
- Acceso rápido a registrar venta/gasto

**Fórmula salud:** `progress * 0.6 + max(margin, 0) * 0.4`

---

### 2. Sistema Base 21 Días (Checklist)

Sección principal. Dividida en 3 semanas.

**Semana 1 — Control Financiero Básico:**
- Registrar ventas diarias
- Registrar ventas por método de pago
- Registrar gastos fijos
- Registrar gastos variables
- Separar dinero personal y del negocio
- Lista de proveedores
- Definir costo operativo mensual

**Semana 2 — Análisis de Rentabilidad:**
- Revisar recetas estandarizadas (¿ya existen?)
- Revisar costos reales por producto
- Detectar productos rentables
- Detectar productos poco rentables
- Revisar precios actuales
- Analizar ticket promedio
- Detectar productos estrella
- Revisar margen general

**Semana 3 — Operación y Orden Interno:**
- Conteo semanal de inventario
- Rutina de apertura
- Rutina de cierre
- Bitácora diaria
- Registro de incidencias
- Revisar productos agotados frecuentes
- Medir tiempos de servicio
- Revisar atención al cliente
- Calcular utilidad real mensual
- Definir metas siguiente mes

**Cada tarea tiene:** checkbox · status (pendiente/en_progreso/hecho) · fecha completado · notas · prioridad · tiempo estimado · Por qué importa · Cómo hacerlo · Ejemplo · Error común · Acción recomendada.

---

### 3. Ventas y Gastos

Registro manual de movimientos financieros diarios.

**Ventas:**
- Monto total
- Método de pago (efectivo / tarjeta / transferencia)
- Fecha
- Nota opcional
- Opcional: asociar a producto(s) vendidos

**Gastos:**
- Monto
- Categoría (insumos / nómina / renta / servicios / mantenimiento / otros)
- Fecha
- Nota opcional

**Vista:** lista de movimientos del día/mes, totales del mes en cabecera.

---

### 4. Productos (POS-lite)

Catálogo ligero para conocer qué se vende más.

**Producto:**
- Nombre (ej. "Hamburguesa Clásica")
- Categoría (ej. "Hamburguesas", "Bebidas", "Extras")
- Precio base
- Activo/inactivo

**Variante:**
- Nombre (ej. "Sencilla", "Doble", "Con papas")
- Ajuste de precio (+/- sobre precio base)

**Uso:** al registrar una venta, el usuario puede (opcionalmente) agregar líneas de producto + qty + variante. Esto genera `sale_items` que alimentan:
- Ranking productos más vendidos
- Ticket promedio calculado desde datos reales
- Tendencia por producto

**No es:** POS con impresoras, splits de mesa, propinas, ni cocina técnica.

---

### 5. KPIs

Captura mensual de indicadores resumen (complementa el detalle diario de ventas/gastos).

**Captura:** mes · ventas · gastos · clientes · tickets

**Muestra:**
- Ticket promedio
- Margen estimado
- Tendencia vs. mes anterior
- Días fuertes / débiles (cuando haya datos diarios)

---

### 6. Plantillas Administrativas

8 formatos editables guardados por usuario:

1. Corte de caja diario
2. Registro ventas
3. Registro gastos
4. Lista proveedores
5. Bitácora diaria
6. Metas mensuales
7. Auditoría semanal
8. Estado general del negocio

Cada plantilla: texto editable + botón guardar. Se almacenan en `notes` con prefijo `template:`.

---

### 7. Roadmap — 7 Fases

Ruta real: **negocio familiar → profesional → escalable → multisucursal → franquicia → cadena nacional**.

| Fase | Nombre | Estado inicial |
|------|--------|----------------|
| 1 | Orden interno y profesionalización | Desbloqueado |
| 2 | Marca sólida y experiencia cliente | Bloqueado (requiere Fase 1) |
| 3 | Sistema administrativo moderno | Bloqueado |
| 4 | Rentabilidad y expansión local | Bloqueado |
| 5 | Preparación franquicia | Bloqueado |
| 6 | Lanzamiento franquicia | Bloqueado |
| Extra | Nivel cadena fuerte | Bloqueado |

Cada fase muestra: objetivo · lista tareas · requisitos previos · tiempo estimado · estado bloqueado/desbloqueado.

**Advertencia permanente:** "Muchos quieren franquiciar antes de dominar una sola sucursal. Las 10 bases primero."

---

### 8. Logros (Gamificación)

Achievements desbloqueados automáticamente:

| Logro | Condición |
|-------|-----------|
| Primera tarea completada | 1 tarea hecha |
| Semana 1 completada | Todas las tareas de semana 1 hechas |
| Semana 2 completada | Todas las tareas de semana 2 hechas |
| Semana 3 completada | Todas las tareas de semana 3 hechas |
| Negocio organizado | Sistema Base 21 días 100% |
| Primer mes medido | Al menos 1 KPI guardado |
| Control financiero | 10+ ventas/gastos registrados |
| Base lista para crecer | Logros anteriores + salud > 70 |

---

## DB Schema

```sql
-- Existentes
business_profiles (id, user_id, business_name, city, created_at)
tasks (id, slug, week, title, description, why, how, example, common_error, recommended_action, priority, estimate_hours)
task_progress (id, user_id, task_id, status, completed, completed_at, notes, created_at, updated_at)
notes (id, user_id, title, content, created_at)
finance_entries (id, user_id, entry_type, category, amount, entry_date, payment_method, notes, created_at)
kpis (id, user_id, period_month, sales, expenses, customers, tickets, created_at)
phases (id, name, objective, prerequisites[], estimate, order_index)
phase_tasks (id, phase_id, task)
templates (id, slug, name, purpose)

-- Pendientes
products (
  id uuid pk,
  user_id uuid not null,
  name text not null,
  category text,
  base_price numeric(10,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
)

product_variants (
  id uuid pk,
  product_id uuid references products(id) on delete cascade,
  name text not null,
  price_adjustment numeric(10,2) not null default 0
)

sale_items (
  id uuid pk,
  finance_entry_id uuid references finance_entries(id) on delete cascade,
  user_id uuid not null,
  product_id uuid references products(id),
  variant_id uuid references product_variants(id),
  quantity integer not null default 1,
  unit_price numeric(10,2) not null,
  created_at timestamptz default now()
)
```

---

## UX Philosophy — App como tutor, no herramienta

El usuario no es experto en finanzas ni administración. Su objetivo: tener el negocio 100% estandarizado, cueste lo que cueste. La app debe sentirse como un **consultor digital que lo guía paso a paso**, no como un formulario frío.

- **Cada pantalla explica el "por qué"** antes de pedir acción. Nunca mostrar un campo vacío sin contexto.
- **Lenguaje de dueño de negocio**, no de contador. "Cuánto te quedó de ganancia" no "utilidad neta".
- **Siempre hay un próximo paso visible** — el usuario nunca debe preguntarse "¿qué hago ahora?".
- **Celebrar avances** — completar una tarea, una semana, un mes medido merece reconocimiento visible.
- **Explicar los números** — no solo mostrar "$12,500", sino "este mes te quedaron $12,500 de ganancia. Eso es bueno/regular/bajo porque...".
- **Contexto en cada sección** — callout educativo visible en cada módulo explicando qué hace esa sección y por qué importa.

## UX Principles

1. **Primero en mobile** — negocio físico, usuario en mostrador.
2. **Acciones en máx. 3 taps** — registrar venta: tap → monto → guardar.
3. **Dark mode siempre** — reduce fatiga en ambiente de cocina/restaurante.
4. **Sin jerga técnica** — "Salud del negocio" no "Health Score".
5. **Feedback inmediato** — confirmar cada acción con mensaje visible.
6. **Progressive disclosure** — roadmap bloqueado hasta completar prerequisito.
7. **Tutorial-first** — onboarding guiado para usuarios nuevos, contextual tips en cada sección.

---

## What This App Is NOT

- No recetas (otra app)
- No costeo técnico por ingrediente (otra app)
- No inventario detallado (otra app)
- No POS completo con impresoras/mesa/propinas
- No nómina ni RRHH
- No programa de lealtad (Fase 3+, fuera de scope actual)

---

## Immediate Priorities (backlog)

1. **Refactorizar arquitectura** — separar page.tsx en rutas/módulos
2. **Completar checklist** — agregar las ~17 tareas faltantes (semanas 1-3 incompletas en data.ts)
3. **Módulo Ventas/Gastos** — form completo con categoría, método pago, lista de movimientos
4. **Módulo Productos** — CRUD productos + variantes
5. **Integrar sale_items** — vincular venta → producto → derivar métricas
6. **Logros funcionales** — lógica real de desbloqueo
7. **Supabase schema** — agregar products, product_variants, sale_items

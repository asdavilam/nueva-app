import { ChecklistTask, Phase, Template } from "@/lib/types";

export const checklistTasks: ChecklistTask[] = [
  {
    id: "w1-1",
    week: 1,
    title: "Registrar ventas diarias",
    status: "hecho",
    completed: true,
    completedAt: "2026-05-01",
    priority: "alta",
    estimateHours: 1,
    notes: "Formato diario iniciado.",
    why: "Te permite ver flujo real y detectar caídas rápidas.",
    how: "Registrar total por día al cierre.",
    example: "Lunes: $8,500, Martes: $7,900.",
    commonError: "No registrar días con baja venta.",
    action: "Establecer corte diario obligatorio."
  },
  {
    id: "w1-2",
    week: 1,
    title: "Registrar ventas por método de pago",
    status: "en_progreso",
    completed: false,
    completedAt: null,
    priority: "alta",
    estimateHours: 1,
    notes: "Falta separar transferencias.",
    why: "Evita fugas y mejora conciliación de caja.",
    how: "Separar efectivo, tarjeta y transferencia.",
    example: "Efectivo 45%, tarjeta 40%, transferencia 15%.",
    commonError: "Mezclar métodos en una sola cifra.",
    action: "Usar una línea por método."
  },
  {
    id: "w1-3",
    week: 1,
    title: "Registrar gastos fijos",
    status: "pendiente",
    completed: false,
    completedAt: null,
    priority: "alta",
    estimateHours: 2,
    notes: "",
    why: "Te da el piso mínimo que debes cubrir cada mes.",
    how: "Listar renta, nómina, servicios y software.",
    example: "Renta $18k, nómina $42k.",
    commonError: "Olvidar servicios menores.",
    action: "Crear recordatorio de revisión semanal."
  },
  {
    id: "w2-1",
    week: 2,
    title: "Detectar productos rentables",
    status: "pendiente",
    completed: false,
    completedAt: null,
    priority: "media",
    estimateHours: 2,
    notes: "",
    why: "Define dónde concentrar promoción y esfuerzo.",
    how: "Comparar ventas mensuales vs margen estimado.",
    example: "Combo clásico vende alto y deja margen sólido.",
    commonError: "Decidir por intuición sin datos.",
    action: "Top 3 rentables en menú destacado."
  },
  {
    id: "w2-2",
    week: 2,
    title: "Analizar ticket promedio",
    status: "pendiente",
    completed: false,
    completedAt: null,
    priority: "alta",
    estimateHours: 1,
    notes: "",
    why: "Impacta ingresos sin depender de más clientes.",
    how: "Ventas totales del periodo / número de tickets.",
    example: "$120,000 / 1,500 tickets = $80 ticket promedio.",
    commonError: "Usar clientes en lugar de tickets.",
    action: "Crear upsell simple en mostrador."
  },
  {
    id: "w3-1",
    week: 3,
    title: "Crear bitácora diaria",
    status: "pendiente",
    completed: false,
    completedAt: null,
    priority: "media",
    estimateHours: 1,
    notes: "",
    why: "Conserva contexto operativo para decisiones.",
    how: "Registrar eventos clave, incidencias y acciones.",
    example: "Falla de plancha 30 min, se resolvió a las 3:20 pm.",
    commonError: "Bitácora genérica sin seguimiento.",
    action: "Cierre de turno con responsable."
  }
];

export const templates: Template[] = [
  { id: "t1", name: "Corte de caja diario", purpose: "Control de ingresos y diferencias de caja." },
  { id: "t2", name: "Registro ventas", purpose: "Seguimiento diario y semanal de ventas." },
  { id: "t3", name: "Registro gastos", purpose: "Clasificación de gastos fijos y variables." },
  { id: "t4", name: "Lista proveedores", purpose: "Control de contactos, precios y tiempos." },
  { id: "t5", name: "Bitácora diaria", purpose: "Incidencias y aprendizajes operativos." },
  { id: "t6", name: "Metas mensuales", purpose: "Definir foco de crecimiento por mes." },
  { id: "t7", name: "Auditoría semanal", purpose: "Chequeo rápido de orden administrativo." },
  { id: "t8", name: "Estado general del negocio", purpose: "Foto ejecutiva de salud del negocio." }
];

export const phases: Phase[] = [
  {
    id: 1,
    name: "Fase 1: Orden interno y profesionalización",
    objective: "Estandarizar control administrativo y ejecución básica.",
    tasks: ["Completar sistema base 21 días", "Formalizar rutinas semanales"],
    prerequisites: ["Definir responsable operativo"],
    estimate: "4-6 semanas",
    status: "desbloqueado"
  },
  {
    id: 2,
    name: "Fase 2: Marca sólida y experiencia cliente",
    objective: "Unificar experiencia y percepción de marca.",
    tasks: ["Mejorar atención", "Mapear puntos de fricción del cliente"],
    prerequisites: ["Fase 1 completada"],
    estimate: "4-8 semanas",
    status: "bloqueado"
  },
  {
    id: 3,
    name: "Fase 3: Sistema administrativo moderno",
    objective: "Consolidar reportes y decisiones por datos.",
    tasks: ["Ritmo mensual de indicadores", "Tablero ejecutivo"],
    prerequisites: ["Fase 2 estable"],
    estimate: "6-10 semanas",
    status: "bloqueado"
  },
  {
    id: 4,
    name: "Fase 4: Rentabilidad y expansión local",
    objective: "Optimizar utilidad y preparar siguiente sucursal.",
    tasks: ["Meta de margen", "Prueba de crecimiento local"],
    prerequisites: ["Fase 3 activa"],
    estimate: "8-12 semanas",
    status: "bloqueado"
  },
  {
    id: 5,
    name: "Fase 5: Preparación franquicia",
    objective: "Definir estándar replicable del negocio.",
    tasks: ["Documentar procesos críticos", "Diseñar criterios de franquicia"],
    prerequisites: ["Fase 4 validada"],
    estimate: "10-14 semanas",
    status: "bloqueado"
  },
  {
    id: 6,
    name: "Fase 6: Lanzamiento franquicia",
    objective: "Ejecutar primera franquicia con control.",
    tasks: ["Kit de arranque", "Acompañamiento inicial"],
    prerequisites: ["Fase 5 cerrada"],
    estimate: "12-20 semanas",
    status: "bloqueado"
  },
  {
    id: 7,
    name: "Fase 7: Cadena fuerte / expansión nacional",
    objective: "Escalar con consistencia y salud financiera.",
    tasks: ["Modelo multiunidad", "Gobierno de marca y calidad"],
    prerequisites: ["Fase 6 operando"],
    estimate: "12+ meses",
    status: "bloqueado"
  }
];

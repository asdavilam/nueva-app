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
    why: "Si no anotas ventas cada día, es fácil perder control del dinero sin darte cuenta.",
    how: "Al cerrar, anota cuánto vendiste en total ese día (aunque haya sido poco).",
    example: "Lunes: $8,500 | Martes: $7,900 | Miércoles: $6,200.",
    commonError: "Solo registrar los días buenos y dejar en blanco los días flojos.",
    action: "Haz el registro diario en el mismo horario todos los días."
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
    why: "Te ayuda a detectar diferencias de caja y entender cómo te pagan más tus clientes.",
    how: "Separa el total diario en tres partes: efectivo, tarjeta y transferencia.",
    example: "Total del día: $10,000 -> Efectivo $4,500, Tarjeta $4,000, Transferencia $1,500.",
    commonError: "Poner todo junto en una sola cifra y después no saber qué faltó.",
    action: "Usa una línea por método y revisa al final del turno."
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
    why: "Así sabes cuánto debes vender mínimo para no perder dinero.",
    how: "Haz una lista mensual de gastos que siempre pagas: renta, sueldos, luz, internet, etc.",
    example: "Renta $18,000 + Nómina $42,000 + Servicios $6,500 = $66,500 fijos al mes.",
    commonError: "Olvidar gastos pequeños que al final sí pesan.",
    action: "Actualiza esta lista cada semana para no dejar nada fuera."
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
    why: "Te enfocas en vender más de lo que sí deja utilidad.",
    how: "Compara qué productos se venden mucho y cuáles te dejan mejor margen.",
    example: "La hamburguesa clásica se vende mucho y deja buen margen: conviene promoverla.",
    commonError: "Elegir por gusto personal y no por números.",
    action: "Define tus 3 productos más rentables y promuévelos primero."
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
    why: "Si subes el ticket promedio, ganas más sin necesitar más gente entrando.",
    how: "Divide ventas totales entre número de tickets del periodo.",
    example: "$120,000 / 1,500 tickets = $80 por ticket promedio.",
    commonError: "Confundir clientes con tickets o mezclar periodos distintos.",
    action: "Agrega una venta sugerida simple: papas + bebida en caja."
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
    why: "Te permite aprender de lo que pasa y evitar repetir errores.",
    how: "Escribe cada día incidencias, decisiones tomadas y resultado.",
    example: "Plancha falló 30 min; se llamó técnico; servicio normal a las 3:20 pm.",
    commonError: "Anotar cosas vagas sin qué pasó ni qué se hizo.",
    action: "Cierra turno con una nota corta y responsable asignado."
  }
];

export const templates: Template[] = [
  { id: "t1", name: "Corte de caja diario", purpose: "Control de ingresos y diferencias de caja.", sample: "Fecha:\nTurno:\nEfectivo inicial:\nVentas efectivo:\nVentas tarjeta:\nVentas transferencia:\nTotal esperado:\nTotal contado:\nDiferencia:\nResponsable:" },
  { id: "t2", name: "Registro ventas", purpose: "Seguimiento diario y semanal de ventas.", sample: "Fecha:\nVentas totales:\n# Tickets:\nTicket promedio:\nProducto más vendido:\nObservaciones del día:" },
  { id: "t3", name: "Registro gastos", purpose: "Clasificación de gastos fijos y variables.", sample: "Fecha:\nTipo de gasto (fijo/variable):\nConcepto:\nMonto:\nMétodo de pago:\n¿Era necesario? (sí/no)\nComentario:" },
  { id: "t4", name: "Lista proveedores", purpose: "Control de contactos, precios y tiempos.", sample: "Proveedor:\nProducto:\nPrecio:\nTiempo de entrega:\nContacto:\nÚltima compra:\nCalificación (1-5):" },
  { id: "t5", name: "Bitácora diaria", purpose: "Incidencias y aprendizajes operativos.", sample: "Fecha:\nQué pasó:\nImpacto:\nQué se hizo:\nResultado:\nAcción para evitar repetirlo:" },
  { id: "t6", name: "Metas mensuales", purpose: "Definir foco de crecimiento por mes.", sample: "Mes:\nMeta de ventas:\nMeta de gastos:\nMeta de ticket promedio:\nMeta de servicio:\nAcciones clave de este mes:" },
  { id: "t7", name: "Auditoría semanal", purpose: "Chequeo rápido de orden administrativo.", sample: "Semana:\n¿Se registraron ventas diarias? (sí/no)\n¿Se registraron gastos? (sí/no)\n¿Se hizo corte de caja? (sí/no)\n¿Hubo faltantes? (sí/no)\nPendientes críticos:" },
  { id: "t8", name: "Estado general del negocio", purpose: "Foto ejecutiva de salud del negocio.", sample: "Periodo:\nVentas:\nGastos:\nUtilidad:\nTicket promedio:\nProducto estrella:\nPrincipal problema:\nPróxima acción prioritaria:" }
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

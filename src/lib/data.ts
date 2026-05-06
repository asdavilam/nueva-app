import { ChecklistTask, Phase, Template } from "@/lib/types";

export const checklistTasks: ChecklistTask[] = [
  // ── SEMANA 1: CONTROL FINANCIERO BÁSICO ──
  {
    id: "w1-1", week: 1,
    title: "Registrar ventas diarias",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 1, notes: "",
    why: "Si no anotas cuánto vendiste cada día, es imposible saber si tu negocio está ganando o perdiendo dinero.",
    how: "Al cerrar el turno, anota el total de ventas de ese día. Aunque haya sido un día malo, regístralo igual.",
    example: "Lunes: $8,500 | Martes: $7,900 | Miércoles: $6,200.",
    commonError: "Solo registrar los días buenos y dejar en blanco los días flojos. Eso distorsiona la realidad.",
    action: "Haz el registro en el mismo horario todos los días — al cerrar se vuelve hábito fácilmente."
  },
  {
    id: "w1-2", week: 1,
    title: "Registrar ventas por método de pago",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 1, notes: "",
    why: "Separar efectivo, tarjeta y transferencia te ayuda a detectar diferencias de caja y saber cómo te pagan más tus clientes.",
    how: "Del total diario, separa en tres partes: efectivo, tarjeta y transferencia.",
    example: "Total del día: $10,000 → Efectivo $4,500, Tarjeta $4,000, Transferencia $1,500.",
    commonError: "Poner todo en una sola cifra y después no entender por qué faltan $500 en la caja.",
    action: "Usa una línea por método de pago en tu corte de caja y revísalo al final del turno."
  },
  {
    id: "w1-3", week: 1,
    title: "Registrar gastos fijos",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 2, notes: "",
    why: "Saber cuánto gastas fijo cada mes te dice exactamente cuánto debes vender mínimo para no perder dinero.",
    how: "Haz una lista de todos los gastos que pagas siempre, sin importar cuánto vendas: renta, sueldos, luz, gas, internet.",
    example: "Renta $18,000 + Nómina $42,000 + Servicios $6,500 = $66,500 fijos al mes.",
    commonError: "Olvidar gastos pequeños como bolsas, detergente o gas de limpieza — al mes suman más de lo que crees.",
    action: "Escribe todos tus gastos fijos ahora y ponles un monto estimado. Actualízalos cada mes."
  },
  {
    id: "w1-4", week: 1,
    title: "Registrar gastos variables",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 1, notes: "",
    why: "Los gastos variables (insumos, empaques, utensilios) cambian según cuánto vendas. Si no los controlas, pueden comerse tu ganancia sin que te des cuenta.",
    how: "Cada compra de insumos o material que hagas, regístrala el mismo día con el monto y para qué fue.",
    example: "Lunes: $2,300 carne + $800 papas + $400 bolsas = $3,500 en variables ese día.",
    commonError: "Creer que como ya compraste no necesitas anotarlo. El problema es al final del mes cuando no sabes a dónde se fue el dinero.",
    action: "Guarda todos los tickets de compra en un solo lugar y regístralos el mismo día o al día siguiente."
  },
  {
    id: "w1-5", week: 1,
    title: "Separar dinero personal y del negocio",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 2, notes: "",
    why: "Mezclar tu dinero personal con el del negocio es la causa más común de quiebra en negocios familiares. No sabes cuánto ganó el negocio realmente.",
    how: "Abre una cuenta bancaria solo para el negocio. Define un 'sueldo' fijo que te pagas a ti mismo cada semana o mes.",
    example: "Negocio recibe $150,000 al mes. Tú te pagas $20,000 como sueldo. El resto queda en la cuenta del negocio.",
    commonError: "Tomar dinero de la caja cuando lo necesitas sin registrarlo. Eso hace que nunca sepas la ganancia real.",
    action: "Esta semana abre o designa una cuenta solo para el negocio y deposita las ventas ahí."
  },
  {
    id: "w1-6", week: 1,
    title: "Crear lista de proveedores",
    status: "pendiente", completed: false, completedAt: null,
    priority: "media", estimateHours: 2, notes: "",
    why: "Sin una lista organizada de proveedores, cuando algo falta o sube de precio no sabes a quién llamar ni si te están cobrando de más.",
    how: "Haz una hoja con: nombre del proveedor, qué te vende, precio actual, teléfono de contacto y cada cuánto compras.",
    example: "Proveedor: Don Chuy | Producto: Carne | Precio: $145/kg | Tel: 55-1234-5678 | Entrega: lunes y jueves.",
    commonError: "Tener todo en la memoria del dueño. Si alguien más necesita hacer una compra, no sabe a quién llamar.",
    action: "Dedica 30 minutos a escribir todos tus proveedores actuales con sus datos. Empieza con los 5 más importantes."
  },
  {
    id: "w1-7", week: 1,
    title: "Definir costo operativo mensual",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 2, notes: "",
    why: "El costo operativo mensual es cuánto te cuesta abrir cada mes. Si no lo sabes, no sabes si estás ganando o solo sobreviviendo.",
    how: "Suma tus gastos fijos + un estimado de tus gastos variables del mes. Ese es tu punto de equilibrio.",
    example: "Gastos fijos $66,500 + Insumos estimados $45,000 = Costo operativo $111,500/mes. Necesitas vender más de eso para ganar.",
    commonError: "No incluir tu propio sueldo como gasto — si no te pagas, en realidad el negocio no está siendo rentable.",
    action: "Calcula tu costo operativo hoy. Si tus ventas mensuales no superan ese número, tienes un problema urgente que resolver."
  },

  // ── SEMANA 2: ANÁLISIS DE RENTABILIDAD ──
  {
    id: "w2-1", week: 2,
    title: "Revisar si tienes recetas estandarizadas",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 1, notes: "",
    why: "Sin recetas fijas, cada hamburguesa que preparas puede tener diferente tamaño, sabor y costo. Eso hace imposible calcular tu ganancia real.",
    how: "Revisa si tienes escritas las recetas de cada producto de tu menú. Si usas otra app para recetas, consúltala. Si no las tienes, este es el momento de crearlas.",
    example: "Burger Clásica: 150g carne, 1 bollo, 2 hojas lechuga, 1 rodaja jitomate, 30g queso amarillo, 15g aderezo.",
    commonError: "Preparar 'a ojo' cada producto. Dos hamburguesas 'iguales' con distinto costo hacen que no sepas si estás ganando.",
    action: "Lista todos los productos de tu menú. Marca cuáles tienen receta escrita y cuáles no. Los que no tienen, son tu tarea esta semana."
  },
  {
    id: "w2-2", week: 2,
    title: "Revisar costos reales por producto",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 2, notes: "",
    why: "Si no sabes cuánto te cuesta hacer cada producto, no puedes saber si tu precio de venta tiene sentido o si estás vendiendo a pérdida.",
    how: "Para cada producto del menú, suma el costo de todos los ingredientes que lleva. Ese es tu costo de producción.",
    example: "Burger Clásica: carne $21.75 + bollo $4.50 + vegetales $3.20 + queso $6.00 + aderezo $1.80 = $37.25 costo, se vende a $120.",
    commonError: "Solo considerar el ingrediente principal (la carne) y olvidar el bollo, salsas, empaque y gas que también cuestan.",
    action: "Calcula el costo de tus 5 productos más vendidos. Si no sabes el precio exacto de ingredientes, usa los precios de tus últimas facturas."
  },
  {
    id: "w2-3", week: 2,
    title: "Detectar productos rentables",
    status: "pendiente", completed: false, completedAt: null,
    priority: "media", estimateHours: 2, notes: "",
    why: "Saber cuáles productos te dejan más dinero te permite enfocar tu energía en vender más de esos y no perder tiempo en los que casi no dejan.",
    how: "Compara: precio de venta menos costo de producción = ganancia bruta por producto. El que deje más % ganancia = más rentable.",
    example: "Burger Clásica: vende a $120, cuesta $37.25 → ganancia $82.75 = 69% de margen. Papas: vende a $45, cuesta $12 → 73% de margen.",
    commonError: "Elegir el producto 'estrella' por volumen de ventas sin revisar si realmente deja dinero.",
    action: "Haz una lista de tus 10 productos ordenados por % de margen. Los de arriba merecen más promoción."
  },
  {
    id: "w2-4", week: 2,
    title: "Detectar productos poco rentables",
    status: "pendiente", completed: false, completedAt: null,
    priority: "media", estimateHours: 1, notes: "",
    why: "Los productos con poco margen consumen tu tiempo, insumos y energía sin darte ganancia proporcional. Hay que modificarlos o eliminarlos.",
    how: "De tu lista de margen por producto, identifica los que estén por debajo del 50% de margen. Analiza si puedes subir precio, reducir costo o eliminarlos.",
    example: "Refresco de lata: compras a $18, vendes a $25 → solo $7 de ganancia = 28% margen. ¿Vale la pena tenerlo o subir el precio?",
    commonError: "Quedarte con productos poco rentables 'porque los clientes los piden'. Puedes ofrecer alternativas mejores para ti.",
    action: "Identifica tus 3 productos menos rentables y decide: ¿subes precio, cambias proveedor o los quitas del menú?"
  },
  {
    id: "w2-5", week: 2,
    title: "Revisar precios actuales",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 2, notes: "",
    why: "Los precios del mercado y tus costos cambian constantemente. Si no revisas tus precios cada 3-6 meses, puedes estar vendiendo sin ganar.",
    how: "Compara tus precios con la competencia cercana. Revisa si tus costos subieron desde la última vez que pusiste precios.",
    example: "El kilo de carne subió de $140 a $160 (+14%). Tu burger clásica a $120 ahora tiene menos margen. ¿La subiste de precio?",
    commonError: "No subir precios por miedo a perder clientes, cuando en realidad estás vendiendo más barato que tu propio costo.",
    action: "Revisa tus precios vs. costos actuales. Si algún producto ya no tiene al menos 50% de margen, es momento de ajustar precio."
  },
  {
    id: "w2-6", week: 2,
    title: "Analizar ticket promedio",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 1, notes: "",
    why: "El ticket promedio es cuánto gasta en promedio cada cliente. Si lo subes aunque sea $20, con 50 clientes al día son $1,000 más sin esfuerzo extra.",
    how: "Divide tus ventas totales de una semana entre el número de tickets (comandas) de esa semana.",
    example: "$120,000 ventas ÷ 1,500 tickets = $80 ticket promedio. Si agregas una sugerencia de combo, podrías llevarlo a $100.",
    commonError: "Confundir número de clientes con número de tickets. Un ticket puede tener compras de varias personas.",
    action: "Calcula tu ticket promedio de esta semana. Si está por debajo de $100, piensa en qué combos o extras puedes sugerir en caja."
  },
  {
    id: "w2-7", week: 2,
    title: "Identificar productos estrella",
    status: "pendiente", completed: false, completedAt: null,
    priority: "media", estimateHours: 1, notes: "",
    why: "Tu producto estrella es el que más se vende Y deja buen margen. Es tu motor de ventas. Debes protegerlo, mejorarlo y promocionarlo siempre.",
    how: "Cruza dos listas: los más vendidos y los más rentables. El que aparezca en ambas es tu estrella.",
    example: "Burger Doble: la más vendida del menú y con 65% de margen. Es tu estrella. Ponla destacada en el menú y redes sociales.",
    commonError: "Creer que el producto estrella es el que más te gusta a ti. Los datos mandan, no la intuición.",
    action: "Define hoy cuál es tu producto estrella. Asegúrate de que siempre tenga ingredientes disponibles y buena presentación."
  },
  {
    id: "w2-8", week: 2,
    title: "Revisar margen general del negocio",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 1, notes: "",
    why: "El margen general te dice qué porcentaje de tus ventas totales se convierte en ganancia. Es el indicador más importante de salud financiera.",
    how: "Fórmula: (Ventas - Gastos totales) ÷ Ventas × 100. Un buen restaurante busca 15-25% de margen neto.",
    example: "Ventas $200,000 - Gastos $165,000 = Ganancia $35,000. Margen = 35,000 ÷ 200,000 × 100 = 17.5%. Está en rango saludable.",
    commonError: "Solo calcular el margen de los ingredientes (costo de receta) y olvidar sumar renta, sueldos y servicios.",
    action: "Calcula tu margen general con los datos del mes pasado. Si está por debajo del 10%, necesitas revisar costos o subir precios urgente."
  },

  // ── SEMANA 3: OPERACIÓN Y ORDEN INTERNO ──
  {
    id: "w3-1", week: 3,
    title: "Realizar conteo semanal de inventario",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 2, notes: "",
    why: "Sin contar tu inventario cada semana, no sabes cuándo se acaba algo hasta que ya se acabó, ni si hay mermas o robos.",
    how: "Cada lunes (o el día más tranquilo), cuenta todos tus ingredientes y materiales. Compara con lo que debería quedar según tus ventas.",
    example: "Abriste con 50 kg de carne, vendiste 35 kg en recetas → deberías tener 15 kg. Si tienes 12 kg, hay 3 kg de merma a investigar.",
    commonError: "No contarlo porque 'es mucho trabajo'. Una merma no detectada puede costarte miles al mes sin que lo notes.",
    action: "Programa el conteo de inventario para el mismo día y hora cada semana. Hazlo rutina, no tarea especial."
  },
  {
    id: "w3-2", week: 3,
    title: "Crear rutina de apertura",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 2, notes: "",
    why: "Una rutina de apertura garantiza que el negocio abra siempre en las mismas condiciones, sin importar quién esté ese día.",
    how: "Lista todos los pasos que deben hacerse antes de atender el primer cliente: limpieza, mise en place, encender equipos, revisar inventario del día.",
    example: "6:00 Limpiar equipo. 6:15 Preparar ingredientes. 6:30 Verificar caja. 6:45 Encender freidoras. 7:00 Abrir.",
    commonError: "Tener la rutina solo en la cabeza del dueño. Si falta ese día, nadie sabe qué hacer primero.",
    action: "Escribe tu checklist de apertura con horarios. Imprímelo y ponlo en un lugar visible de la cocina."
  },
  {
    id: "w3-3", week: 3,
    title: "Crear rutina de cierre",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 2, notes: "",
    why: "El cierre correcto protege tus equipos, mantiene la higiene y prepara el negocio para el siguiente día. También es cuando haces tu corte de caja.",
    how: "Define todos los pasos al cerrar: limpieza profunda, guardar ingredientes, corte de caja, apagar equipos, checklist de seguridad.",
    example: "22:00 Última orden. 22:15 Limpiar equipos. 22:30 Guardar ingredientes. 22:45 Corte de caja. 23:00 Cerrar.",
    commonError: "Salir rápido sin hacer cierre completo. Los equipos mal apagados o ingredientes mal guardados generan pérdidas.",
    action: "Crea tu checklist de cierre hoy y asigna un responsable de verificarlo cada noche."
  },
  {
    id: "w3-4", week: 3,
    title: "Crear bitácora diaria",
    status: "pendiente", completed: false, completedAt: null,
    priority: "media", estimateHours: 1, notes: "",
    why: "La bitácora es la memoria del negocio. Te permite aprender de lo que pasa, detectar patrones y no repetir errores.",
    how: "Al final de cada turno, anota en 3-5 líneas: ¿qué pasó hoy importante? ¿hubo algún problema? ¿qué se hizo al respecto?",
    example: "Martes 7/05: Se acabó la carne a las 3pm. Perdimos 8 clientes. Llamamos a Don Chuy — entrega urgente llegó a las 5pm. Solución: pedir los lunes más.",
    commonError: "Anotar cosas vagas como 'día normal' sin detalles. Una bitácora sin detalles no sirve para nada.",
    action: "Empieza tu bitácora hoy. Una entrada de 3 líneas es suficiente para comenzar el hábito."
  },
  {
    id: "w3-5", week: 3,
    title: "Registrar incidencias operativas",
    status: "pendiente", completed: false, completedAt: null,
    priority: "media", estimateHours: 1, notes: "",
    why: "Las incidencias son interrupciones que cuestan dinero. Si no las registras, no puedes evitar que se repitan.",
    how: "Cada vez que algo salga mal (equipo falle, falta de ingrediente, queja de cliente, error en pedido), anótalo con fecha, qué pasó y cómo se resolvió.",
    example: "15/05: Plancha dejó de calentar. Técnico tardó 2 horas. Perdimos aprox. $3,000 en ventas. Cotizar plancha de respaldo.",
    commonError: "Tratar cada problema como único y olvidarlo. Si la misma plancha falla 3 veces al mes, hay que reemplazarla.",
    action: "Crea una sección de 'Incidencias' en tu bitácora. Esta semana registra todas las que ocurran, aunque parezcan pequeñas."
  },
  {
    id: "w3-6", week: 3,
    title: "Revisar productos agotados frecuentes",
    status: "pendiente", completed: false, completedAt: null,
    priority: "media", estimateHours: 1, notes: "",
    why: "Quedarte sin un producto popular significa clientes que se van sin comprar y daño a tu reputación. Es un problema evitable.",
    how: "Revisa los últimos 2 meses de bitácora o registros. ¿Qué productos se agotan más seguido? ¿En qué días o semanas?",
    example: "La Burger Doble se agota cada viernes. Solución: pedir 20% más de carne los jueves para cubrir el fin de semana.",
    commonError: "Pedir siempre la misma cantidad sin ajustar según los días de alta demanda.",
    action: "Lista los 3 productos que más se han agotado. Ajusta tu pedido a proveedores para que nunca falten esos."
  },
  {
    id: "w3-7", week: 3,
    title: "Medir tiempos de servicio",
    status: "pendiente", completed: false, completedAt: null,
    priority: "media", estimateHours: 1, notes: "",
    why: "El tiempo que tardas en entregar un pedido afecta directamente la satisfacción del cliente y cuántos clientes puedes atender por hora.",
    how: "Durante un turno, mide el tiempo desde que el cliente ordena hasta que recibe su pedido. Haz esto con 10-15 pedidos.",
    example: "Mediste 15 pedidos: tiempo promedio 12 minutos. El estándar para fast-casual es 7-10 min. Necesitas optimizar el proceso.",
    commonError: "Solo medir en días tranquilos. Los tiempos en horas pico son los que más impactan la experiencia del cliente.",
    action: "Mide hoy durante la hora más ocupada. Si el promedio es más de 10 min, identifica dónde está el cuello de botella."
  },
  {
    id: "w3-8", week: 3,
    title: "Revisar calidad de atención al cliente",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 1, notes: "",
    why: "La atención al cliente es parte de tu producto. Un cliente que se siente bien atendido regresa y recomienda. Uno mal atendido no vuelve y habla mal.",
    how: "Observa o pide a alguien de confianza que evalúe cómo te atiende tu equipo: saludo, tiempo de respuesta, resolución de problemas.",
    example: "Evaluación: saludo (bien), tiempo de respuesta (bien), manejo de queja por pedido incorrecto (necesita mejorar).",
    commonError: "Creer que la atención es buena porque no hay quejas. La mayoría de clientes insatisfechos no se quejan, simplemente no regresan.",
    action: "Esta semana pide la opinión de 5 clientes sobre su experiencia. Sus respuestas te dirán más que cualquier suposición."
  },
  {
    id: "w3-9", week: 3,
    title: "Calcular utilidad real del mes",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 2, notes: "",
    why: "La utilidad real es lo que el negocio ganó después de pagar TODO: ingredientes, renta, sueldos, servicios y tu propio sueldo. Es el número que más importa.",
    how: "Ventas totales del mes - Todos los gastos del mes (incluye tu sueldo) = Utilidad real. Si es positivo, estás ganando. Si es negativo, estás perdiendo.",
    example: "Ventas $200,000 - Insumos $75,000 - Nómina $45,000 - Renta $18,000 - Servicios $7,000 - Tu sueldo $20,000 = Utilidad $35,000.",
    commonError: "No incluir tu propio sueldo en los gastos. Si tú trabajas en el negocio, tu tiempo tiene valor y debe ser un gasto.",
    action: "Calcula tu utilidad real del mes pasado hoy. Si no sabes el número exacto, usa estimados — cualquier número es mejor que ninguno."
  },
  {
    id: "w3-10", week: 3,
    title: "Definir metas del siguiente mes",
    status: "pendiente", completed: false, completedAt: null,
    priority: "alta", estimateHours: 1, notes: "",
    why: "Sin metas claras, el negocio avanza a la deriva. Una meta concreta te da dirección y te ayuda a medir si estás mejorando.",
    how: "Define 3-5 metas concretas y medibles para el próximo mes. Deben tener número y fecha.",
    example: "Meta 1: Ventas mínimas $220,000 (10% más que este mes). Meta 2: Ticket promedio $95. Meta 3: Costo operativo bajo $180,000.",
    commonError: "Metas vagas como 'vender más' o 'mejorar el servicio'. Sin número específico no puedes medir si lo lograste.",
    action: "Escribe tus 3 metas para el próximo mes ahora. Ponlas en un lugar visible y revísalas cada semana."
  }
];

export const templates: Template[] = [
  {
    id: "t1", name: "Corte de caja diario", purpose: "Control de ingresos y diferencias de caja al cierre del turno.",
    sample: "Fecha:\nTurno (mañana/tarde/completo):\nEncargado:\n\nEFECTIVO\nFondo inicial: $\nVentas en efectivo: $\nTotal esperado en caja: $\nTotal contado físicamente: $\nDiferencia (+/-): $\n\nTARJETA\nVentas con tarjeta: $\nComprobante terminal: $\n\nTRANSFERENCIA\nVentas por transferencia: $\n\nTOTAL DEL DÍA: $\n\nObservaciones:\nFirma responsable:"
  },
  {
    id: "t2", name: "Registro de ventas diarias", purpose: "Seguimiento de ventas totales y por producto cada día.",
    sample: "Fecha:\nDía de la semana:\n\nVENTAS\nTotal del día: $\nNúmero de tickets: \nTicket promedio: $\n\nMÉTODO DE PAGO\nEfectivo: $\nTarjeta: $\nTransferencia: $\n\nPRODUCTO MÁS VENDIDO HOY:\nSEGUNDO MÁS VENDIDO:\n\nNota del día (algo especial que influyó en ventas):"
  },
  {
    id: "t3", name: "Registro de gastos", purpose: "Control y clasificación de todos los gastos del negocio.",
    sample: "Fecha:\nConcepto del gasto:\nProveedor o destino:\nMonto: $\nTipo: [ ] Fijo  [ ] Variable\nCategoría: [ ] Insumos  [ ] Nómina  [ ] Renta  [ ] Servicios  [ ] Mantenimiento  [ ] Otro\nMétodo de pago: [ ] Efectivo  [ ] Tarjeta  [ ] Transferencia\n¿Tengo factura/ticket?: [ ] Sí  [ ] No\nObservación:"
  },
  {
    id: "t4", name: "Lista de proveedores", purpose: "Directorio de contactos, precios y condiciones de proveedores.",
    sample: "PROVEEDOR 1\nNombre/Empresa:\nProductos que suministra:\nPrecio actual por unidad:\nFrecuencia de compra:\nTiempo de entrega:\nNombre del contacto:\nTeléfono:\nForma de pago:\nCalificación (1-5):\nÚltima actualización de precios:\n\n---\n(Copia el bloque para cada proveedor adicional)"
  },
  {
    id: "t5", name: "Bitácora diaria", purpose: "Registro de eventos, incidencias y aprendizajes operativos.",
    sample: "Fecha:\nEncargado del turno:\n\n¿QUÉ PASÓ HOY?\n(Describe eventos relevantes: ventas inusuales, problemas, logros)\n\nINCIDENCIAS\n[ ] No hubo incidencias\n[ ] Hubo incidencias → describir:\n  Qué pasó:\n  Impacto en operación:\n  Cómo se resolvió:\n  Acción para evitar que se repita:\n\nNIVEL DE ENERGÍA DEL EQUIPO: [ ] Alto  [ ] Normal  [ ] Bajo\n\nNota del encargado:"
  },
  {
    id: "t6", name: "Metas mensuales", purpose: "Definir objetivos concretos y medibles para el mes.",
    sample: "MES:\n\nMETA 1 — VENTAS\nObjetivo: $\nRazón (¿por qué ese número?):\nAcción principal para lograrlo:\n\nMETA 2 — GASTOS\nLímite de gastos: $\nÁrea donde puedo reducir:\n\nMETA 3 — TICKET PROMEDIO\nObjetivo: $\nEstrategia (combos, sugerencias, etc.):\n\nMETA 4 — OPERACIÓN\nAlgo específico a mejorar este mes:\n\nREVISIÓN SEMANAL (marca al finalizar cada semana)\n[ ] Semana 1: ¿Voy bien?\n[ ] Semana 2: ¿Voy bien?\n[ ] Semana 3: ¿Voy bien?\n[ ] Semana 4: ¿Logré las metas?"
  },
  {
    id: "t7", name: "Auditoría semanal rápida", purpose: "Revisión rápida del orden administrativo cada semana.",
    sample: "Semana del ___ al ___:\nResponsable:\n\nCHECKLIST ADMINISTRATIVO\n[ ] Se registraron ventas todos los días\n[ ] Se registraron gastos del periodo\n[ ] Se hizo corte de caja diario\n[ ] Se contó inventario\n[ ] Se revisó bitácora\n\nFINANCIERO\nVentas acumuladas semana: $\nGastos de la semana: $\nFaltantes en caja: $\n\nPRINCIPAL PROBLEMA DE LA SEMANA:\nACCIÓN TOMADA:\n\nPRIORIDAD PARA LA SIGUIENTE SEMANA:"
  },
  {
    id: "t8", name: "Estado general del negocio", purpose: "Radiografía ejecutiva mensual del negocio.",
    sample: "PERIODO:\n\nNÚMEROS CLAVE\nVentas del mes: $\nGastos totales: $\nUtilidad real: $\nTicket promedio: $\nMargen neto: %\n\nPRODUCTO ESTRELLA DEL MES:\nPRODUCTO QUE MÁS PROBLEMAS DIO:\n\nLOGROS DEL MES (3 cosas que salieron bien):\n1.\n2.\n3.\n\nPROBLEMAS QUE DEBO RESOLVER:\n1.\n2.\n\nACCIÓN MÁS IMPORTANTE PARA EL PRÓXIMO MES:\n\nCALIFICACIÓN PERSONAL DEL MES (1-10):"
  }
];

export const phases: Phase[] = [
  {
    id: 1,
    name: "Fase 1: Orden interno y profesionalización",
    objective: "Pasar de operación improvisada a negocio con control real de finanzas, costos y procesos.",
    tasks: [
      "Estandarizar recetas del menú",
      "Costear cada producto individualmente",
      "Calcular utilidad real mensual",
      "Separar finanzas personales y del negocio",
      "Control de caja diario",
      "Inventario semanal",
      "Definir proveedores oficiales",
      "Manual de apertura y cierre",
      "Medir ventas diarias y ticket promedio",
      "Identificar productos estrella",
      "Ajustar precios estratégicamente",
      "Reducir mermas y fugas de dinero"
    ],
    prerequisites: ["Completar Sistema Base 21 días"],
    estimate: "8-12 semanas",
    status: "desbloqueado"
  },
  {
    id: 2,
    name: "Fase 2: Marca sólida y experiencia cliente",
    objective: "Lograr una experiencia consistente y una marca reconocible que diferencie tu negocio.",
    tasks: [
      "Definir identidad de marca profesional",
      "Mejorar logo e imagen visual",
      "Uniformes estandarizados",
      "Empaques con marca",
      "Mejorar presentación del producto",
      "Estandarizar atención al cliente",
      "Crear menú profesional",
      "Mejorar redes sociales",
      "Construir reputación digital y reseñas",
      "Definir propuesta única de valor"
    ],
    prerequisites: ["Fase 1 completada"],
    estimate: "6-10 semanas",
    status: "bloqueado"
  },
  {
    id: 3,
    name: "Fase 3: Sistema administrativo moderno",
    objective: "Controlar el negocio con sistemas y reportes claros, no solo con intuición.",
    tasks: [
      "Implementar sistema POS",
      "Dashboard de ventas en tiempo real",
      "Control de inventario digital",
      "Reportes automáticos diarios",
      "Reportes financieros mensuales",
      "Control de empleados y horarios",
      "Programa de lealtad para clientes"
    ],
    prerequisites: ["Fase 2 estable"],
    estimate: "8-12 semanas",
    status: "bloqueado"
  },
  {
    id: 4,
    name: "Fase 4: Rentabilidad y expansión local",
    objective: "Mantener rentabilidad constante y validar que el modelo funciona en más de una ubicación.",
    tasks: [
      "Operación rentable constante por 6+ meses",
      "Incrementar ticket promedio",
      "Optimizar costos con proveedores",
      "Crear combos estratégicos y rentables",
      "Lanzar delivery rentable",
      "Abrir segunda sucursal propia",
      "Validar operación multisucursal",
      "Formar gerentes operativos confiables"
    ],
    prerequisites: ["Fase 3 activa"],
    estimate: "3-6 meses",
    status: "bloqueado"
  },
  {
    id: 5,
    name: "Fase 5: Preparación para franquicia",
    objective: "Crear la estructura legal, operativa y financiera para franquiciar de forma controlada.",
    tasks: [
      "Registrar marca legalmente",
      "Manual maestro de operaciones",
      "Manual de cocina y recetas",
      "Manual de capacitación completo",
      "Manual de imagen corporativa",
      "Manual financiero para franquiciatarios",
      "Estructura legal de franquicia",
      "Modelo de regalías y fee inicial",
      "Perfil ideal de franquiciatario",
      "Contratos legales especializados"
    ],
    prerequisites: ["Fase 4 validada con 2+ sucursales"],
    estimate: "4-8 meses",
    status: "bloqueado"
  },
  {
    id: 6,
    name: "Fase 6: Lanzamiento de franquicia",
    objective: "Vender y operar las primeras franquicias con control y soporte real.",
    tasks: [
      "Crear unidad piloto modelo documentada",
      "Documentar métricas reales de rentabilidad",
      "Vender primeras 3-5 franquicias controladas",
      "Capacitación inicial de franquiciados",
      "Sistema de soporte continuo",
      "Auditorías periódicas de calidad",
      "Marketing de expansión regional"
    ],
    prerequisites: ["Fase 5 cerrada legalmente"],
    estimate: "6-12 meses",
    status: "bloqueado"
  },
  {
    id: 7,
    name: "Fase Extra: Nivel cadena fuerte",
    objective: "Consolidar estructura corporativa para escalar a nivel nacional o internacional.",
    tasks: [
      "Planta central de producción",
      "Compras consolidadas a gran escala",
      "Centro logístico propio",
      "App propia de pedidos",
      "Academia interna de capacitación",
      "Dirección financiera profesional",
      "Dirección operativa nacional",
      "Venta parcial a inversionistas"
    ],
    prerequisites: ["Fase 6 con 10+ franquicias operando"],
    estimate: "12+ meses",
    status: "bloqueado"
  }
];

import { checklistTasks, phases, templates } from "@/lib/data";
import { BarChart3, CheckCircle2, ClipboardList, Flame, LayoutDashboard, Target } from "lucide-react";

const completed = checklistTasks.filter((task) => task.completed).length;
const progress = Math.round((completed / checklistTasks.length) * 100);
const salesMonth = 120000;
const expensesMonth = 74000;
const utility = salesMonth - expensesMonth;
const tickets = 1500;
const avgTicket = Math.round(salesMonth / tickets);
const healthScore = 78;

const weekLabel = {
  1: "Semana 1",
  2: "Semana 2",
  3: "Semana 3"
} as const;

const grouped = {
  1: checklistTasks.filter((t) => t.week === 1),
  2: checklistTasks.filter((t) => t.week === 2),
  3: checklistTasks.filter((t) => t.week === 3)
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-6 p-4 md:grid-cols-[240px_1fr] md:p-6">
        <aside className="rounded-lg border border-slate-800 bg-panel p-4">
          <h1 className="text-lg font-semibold">Burger Business Blueprint</h1>
          <p className="mt-1 text-sm text-muted">Cerebro administrativo</p>
          <nav className="mt-6 space-y-1 text-sm">
            {[
              ["Dashboard", <LayoutDashboard size={16} key="d" />],
              ["Sistema Base 21 Días", <ClipboardList size={16} key="c" />],
              ["KPIs", <BarChart3 size={16} key="k" />],
              ["Plantillas", <CheckCircle2 size={16} key="p" />],
              ["Roadmap", <Target size={16} key="r" />],
              ["Logros", <Flame size={16} key="l" />]
            ].map(([label, icon]) => (
              <div key={label as string} className="flex items-center gap-2 rounded-md px-2 py-2 text-slate-300 hover:bg-panelSoft">
                {icon}
                <span>{label}</span>
              </div>
            ))}
          </nav>
        </aside>

        <section className="space-y-6">
          <div className="rounded-lg border border-slate-800 bg-panel p-5">
            <h2 className="text-xl font-semibold">Dashboard Ejecutivo</h2>
            <p className="mt-1 text-sm text-muted">Has completado {progress}% del sistema base del negocio.</p>
            <div className="mt-4 h-3 w-full rounded-full bg-slate-800">
              <div className="h-3 rounded-full bg-accent" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Metric title="Ventas del mes" value={`$${salesMonth.toLocaleString("es-MX")}`} />
              <Metric title="Gastos del mes" value={`$${expensesMonth.toLocaleString("es-MX")}`} />
              <Metric title="Utilidad estimada" value={`$${utility.toLocaleString("es-MX")}`} />
              <Metric title="Salud del negocio" value={`${healthScore}/100`} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <section className="rounded-lg border border-slate-800 bg-panel p-5">
                <h3 className="text-lg font-semibold">Sistema Base del Negocio (21 días)</h3>
                <p className="mt-1 text-sm text-muted">Checklist estratégico sin duplicar operación técnica.</p>
                <div className="mt-5 space-y-5">
                  {[1, 2, 3].map((week) => (
                    <div key={week} className="rounded-md border border-slate-700 bg-panelSoft p-4">
                      <h4 className="font-medium">{weekLabel[week as 1 | 2 | 3]}</h4>
                      <div className="mt-3 space-y-3">
                        {grouped[week as 1 | 2 | 3].map((task) => (
                          <div key={task.id} className="rounded-md border border-slate-700 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked={task.completed} readOnly className="size-4 accent-accent" />
                                <p className="font-medium">{task.title}</p>
                              </div>
                              <span className="rounded-full bg-slate-800 px-2 py-1 text-xs uppercase text-slate-300">{task.status.replace("_", " ")}</span>
                            </div>
                            <p className="mt-2 text-xs text-muted">
                              Prioridad: {task.priority} | Estimado: {task.estimateHours}h | Completado: {task.completedAt ?? "N/A"}
                            </p>
                            <p className="mt-2 text-sm text-slate-200">Por qué importa: {task.why}</p>
                            <p className="mt-1 text-sm text-slate-300">Cómo hacerlo: {task.how}</p>
                            <p className="mt-1 text-sm text-slate-300">Ejemplo: {task.example}</p>
                            <p className="mt-1 text-sm text-amber-300">Error común: {task.commonError}</p>
                            <p className="mt-1 text-sm text-emerald-300">Acción recomendada: {task.action}</p>
                            <p className="mt-2 text-xs text-muted">Notas: {task.notes || "Sin notas"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-800 bg-panel p-5">
                <h3 className="text-lg font-semibold">Roadmap futuro (7 fases)</h3>
                <div className="mt-4 space-y-3">
                  {phases.map((phase) => (
                    <div key={phase.id} className="rounded-md border border-slate-700 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{phase.name}</p>
                          <p className="text-sm text-slate-300">{phase.objective}</p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs ${phase.status === "desbloqueado" ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-300"}`}>
                          {phase.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted">Requisitos: {phase.prerequisites.join(", ")} | Tiempo: {phase.estimate}</p>
                      <p className="mt-1 text-xs text-slate-300">Tareas: {phase.tasks.join(" · ")}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-lg border border-slate-800 bg-panel p-5">
                <h3 className="text-lg font-semibold">KPIs (captura manual)</h3>
                <div className="mt-4 space-y-2 text-sm">
                  <KpiRow label="Ventas" value={`$${salesMonth.toLocaleString("es-MX")}`} />
                  <KpiRow label="Gastos" value={`$${expensesMonth.toLocaleString("es-MX")}`} />
                  <KpiRow label="Clientes" value="1,270" />
                  <KpiRow label="Tickets" value={tickets.toString()} />
                  <KpiRow label="Ticket promedio" value={`$${avgTicket.toLocaleString("es-MX")}`} />
                  <KpiRow label="Margen estimado" value="38%" />
                  <KpiRow label="Tendencia mensual" value="+7.5%" />
                  <KpiRow label="Días fuertes" value="Viernes, Sábado" />
                  <KpiRow label="Días bajos" value="Lunes, Martes" />
                </div>
              </section>

              <section className="rounded-lg border border-slate-800 bg-panel p-5">
                <h3 className="text-lg font-semibold">Plantillas administrativas</h3>
                <div className="mt-3 space-y-2 text-sm">
                  {templates.map((t) => (
                    <div key={t.id} className="rounded-md border border-slate-700 p-2">
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted">{t.purpose}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-800 bg-panel p-5">
                <h3 className="text-lg font-semibold">Gamificación</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  <li>Primera tarea completada</li>
                  <li>Semana 1 completada</li>
                  <li>Negocio organizado</li>
                  <li>Primer mes medido</li>
                  <li>Control financiero logrado</li>
                  <li>Base lista para crecer</li>
                </ul>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-700 bg-panelSoft p-3">
      <p className="text-xs text-muted">{title}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function KpiRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-panelSoft px-3 py-2">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

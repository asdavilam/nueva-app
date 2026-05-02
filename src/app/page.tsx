"use client";

import { useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { BarChart3, CheckCircle2, ClipboardList, Flame, LayoutDashboard, Loader2, LogOut, Target } from "lucide-react";
import { ensureCatalogAndProgress } from "@/lib/app-data";
import { phases, templates } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { ChecklistTask, TaskStatus } from "@/lib/types";

type KPIForm = { periodMonth: string; sales: string; expenses: string; customers: string; tickets: string };

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [kpiForm, setKpiForm] = useState<KPIForm>({ periodMonth: "", sales: "", expenses: "", customers: "", tickets: "" });
  const [kpiRows, setKpiRows] = useState<Array<{ sales: number; expenses: number; customers: number; tickets: number }>>([]);
  const [financeMonth, setFinanceMonth] = useState({ sales: 0, expenses: 0 });
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: authSub } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => authSub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    void hydrate(session.user.id);
  }, [session?.user?.id]);

  async function hydrate(userId: string) {
    if (!supabase) return;
    try {
      setBusy(true);
      const hydratedTasks = await ensureCatalogAndProgress(userId);
      setTasks(hydratedTasks);

      const monthStart = new Date();
      monthStart.setDate(1);
      const monthIso = monthStart.toISOString().slice(0, 10);

      const { data: financeRows } = await supabase
        .from("finance_entries")
        .select("entry_type, amount")
        .eq("user_id", userId)
        .gte("entry_date", monthIso);

      const sales = (financeRows ?? []).filter((r) => r.entry_type === "venta").reduce((acc, cur) => acc + Number(cur.amount), 0);
      const expenses = (financeRows ?? []).filter((r) => r.entry_type === "gasto").reduce((acc, cur) => acc + Number(cur.amount), 0);
      setFinanceMonth({ sales, expenses });

      const { data: kpis } = await supabase.from("kpis").select("sales, expenses, customers, tickets").eq("user_id", userId).order("period_month", { ascending: false }).limit(12);
      setKpiRows((kpis ?? []) as Array<{ sales: number; expenses: number; customers: number; tickets: number }>);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo cargar la información.");
    } finally {
      setBusy(false);
    }
  }

  async function signInWithEmail() {
    if (!supabase || !email) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    setFeedback(error ? error.message : "Te envié un magic link al correo.");
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setTasks([]);
    setKpiRows([]);
  }

  async function updateTask(taskId: string, patch: Partial<ChecklistTask>) {
    if (!supabase || !session?.user?.id) return;
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const next = { ...target, ...patch };
    setTasks((prev) => prev.map((t) => (t.id === taskId ? next : t)));

    const { data: row } = await supabase.from("tasks").select("id").eq("slug", taskId).single();
    if (!row) return;

    await supabase
      .from("task_progress")
      .update({
        status: next.status,
        completed: next.completed,
        completed_at: next.completed ? next.completedAt ?? new Date().toISOString().slice(0, 10) : null,
        notes: next.notes
      })
      .eq("user_id", session.user.id)
      .eq("task_id", row.id);
  }

  async function saveKpi() {
    if (!supabase || !session?.user?.id || !kpiForm.periodMonth) return;
    const payload = {
      user_id: session.user.id,
      period_month: `${kpiForm.periodMonth}-01`,
      sales: Number(kpiForm.sales || 0),
      expenses: Number(kpiForm.expenses || 0),
      customers: Number(kpiForm.customers || 0),
      tickets: Number(kpiForm.tickets || 0)
    };
    const { error } = await supabase.from("kpis").upsert(payload, { onConflict: "user_id,period_month" });
    setFeedback(error ? error.message : "KPI guardado.");
    if (!error) await hydrate(session.user.id);
  }

  async function addFinance(entryType: "venta" | "gasto", amount: number) {
    if (!supabase || !session?.user?.id || !amount) return;
    const { error } = await supabase.from("finance_entries").insert({
      user_id: session.user.id,
      entry_type: entryType,
      category: entryType === "venta" ? "venta_manual" : "gasto_manual",
      amount,
      entry_date: new Date().toISOString().slice(0, 10)
    });
    setFeedback(error ? error.message : "Movimiento guardado.");
    if (!error) await hydrate(session.user.id);
  }

  async function saveNote() {
    if (!supabase || !session?.user?.id || !note.trim()) return;
    const { error } = await supabase.from("notes").insert({ user_id: session.user.id, title: "Nota rápida", content: note.trim() });
    setFeedback(error ? error.message : "Nota guardada.");
    if (!error) setNote("");
  }

  const completed = tasks.filter((t) => t.completed).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const utility = financeMonth.sales - financeMonth.expenses;
  const latestKpi = kpiRows[0];
  const avgTicket = latestKpi && latestKpi.tickets > 0 ? Math.round(latestKpi.sales / latestKpi.tickets) : 0;
  const margin = latestKpi && latestKpi.sales > 0 ? Math.round(((latestKpi.sales - latestKpi.expenses) / latestKpi.sales) * 100) : 0;
  const healthScore = Math.max(0, Math.min(100, Math.round(progress * 0.6 + Math.max(margin, 0) * 0.4)));

  const grouped = useMemo(
    () => ({ 1: tasks.filter((t) => t.week === 1), 2: tasks.filter((t) => t.week === 2), 3: tasks.filter((t) => t.week === 3) }),
    [tasks]
  );

  if (!supabase) {
    return <main className="p-6 text-red-300">Falta configurar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.</main>;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center p-4">
        <div className="w-full rounded-lg border border-slate-800 bg-panel p-6">
          <h1 className="text-xl font-semibold">Burger Business Blueprint</h1>
          <p className="mt-2 text-sm text-muted">Inicia sesión con magic link para empezar a operar tu tablero administrativo.</p>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu-correo@empresa.com"
            className="mt-4 w-full rounded-md border border-slate-700 bg-panelSoft px-3 py-2 outline-none"
          />
          <button onClick={signInWithEmail} disabled={busy} className="mt-3 w-full rounded-md bg-accent px-3 py-2 font-medium text-white disabled:opacity-50">
            {busy ? "Enviando..." : "Enviar magic link"}
          </button>
          {feedback ? <p className="mt-3 text-sm text-emerald-300">{feedback}</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-6 p-4 md:grid-cols-[240px_1fr] md:p-6">
        <aside className="rounded-lg border border-slate-800 bg-panel p-4">
          <h1 className="text-lg font-semibold">Burger Business Blueprint</h1>
          <p className="mt-1 text-sm text-muted">Cerebro administrativo</p>
          <button onClick={signOut} className="mt-3 flex items-center gap-2 rounded-md bg-panelSoft px-2 py-1 text-xs text-slate-200">
            <LogOut size={14} /> Salir
          </button>
          <nav className="mt-6 space-y-1 text-sm">
            {[
              ["Dashboard", <LayoutDashboard size={16} key="d" />],
              ["Sistema Base 21 Días", <ClipboardList size={16} key="c" />],
              ["KPIs", <BarChart3 size={16} key="k" />],
              ["Plantillas", <CheckCircle2 size={16} key="p" />],
              ["Roadmap", <Target size={16} key="r" />],
              ["Logros", <Flame size={16} key="l" />]
            ].map(([label, icon]) => (
              <div key={label as string} className="flex items-center gap-2 rounded-md px-2 py-2 text-slate-300">
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
              <Metric title="Ventas del mes" value={`$${financeMonth.sales.toLocaleString("es-MX")}`} />
              <Metric title="Gastos del mes" value={`$${financeMonth.expenses.toLocaleString("es-MX")}`} />
              <Metric title="Utilidad estimada" value={`$${utility.toLocaleString("es-MX")}`} />
              <Metric title="Salud del negocio" value={`${healthScore}/100`} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <QuickAmountButton label="+ Venta $500" onClick={() => addFinance("venta", 500)} />
              <QuickAmountButton label="+ Gasto $300" onClick={() => addFinance("gasto", 300)} />
            </div>
            {feedback ? <p className="mt-3 text-xs text-emerald-300">{feedback}</p> : null}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <section className="rounded-lg border border-slate-800 bg-panel p-5">
                <h3 className="text-lg font-semibold">Sistema Base del Negocio (21 días)</h3>
                {busy ? <p className="mt-2 text-xs text-muted">Sincronizando...</p> : null}
                <div className="mt-5 space-y-5">
                  {[1, 2, 3].map((week) => (
                    <div key={week} className="rounded-md border border-slate-700 bg-panelSoft p-4">
                      <h4 className="font-medium">Semana {week}</h4>
                      <div className="mt-3 space-y-3">
                        {grouped[week as 1 | 2 | 3].map((task) => (
                          <TaskCard key={task.id} task={task} onChange={updateTask} />
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
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-lg border border-slate-800 bg-panel p-5">
                <h3 className="text-lg font-semibold">KPIs (captura manual)</h3>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <input value={kpiForm.periodMonth} onChange={(e) => setKpiForm((p) => ({ ...p, periodMonth: e.target.value }))} type="month" className="col-span-2 rounded-md border border-slate-700 bg-panelSoft px-2 py-2" />
                  <input value={kpiForm.sales} onChange={(e) => setKpiForm((p) => ({ ...p, sales: e.target.value }))} placeholder="Ventas" className="rounded-md border border-slate-700 bg-panelSoft px-2 py-2" />
                  <input value={kpiForm.expenses} onChange={(e) => setKpiForm((p) => ({ ...p, expenses: e.target.value }))} placeholder="Gastos" className="rounded-md border border-slate-700 bg-panelSoft px-2 py-2" />
                  <input value={kpiForm.customers} onChange={(e) => setKpiForm((p) => ({ ...p, customers: e.target.value }))} placeholder="Clientes" className="rounded-md border border-slate-700 bg-panelSoft px-2 py-2" />
                  <input value={kpiForm.tickets} onChange={(e) => setKpiForm((p) => ({ ...p, tickets: e.target.value }))} placeholder="Tickets" className="rounded-md border border-slate-700 bg-panelSoft px-2 py-2" />
                  <button onClick={saveKpi} className="col-span-2 rounded-md bg-accent px-3 py-2 font-medium text-white">Guardar KPI</button>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <KpiRow label="Ticket promedio" value={avgTicket ? `$${avgTicket.toLocaleString("es-MX")}` : "N/A"} />
                  <KpiRow label="Margen estimado" value={`${margin}%`} />
                  <KpiRow label="Tendencia mensual" value={kpiRows.length > 1 ? `${Math.round(((kpiRows[0].sales - kpiRows[1].sales) / Math.max(kpiRows[1].sales, 1)) * 100)}%` : "N/A"} />
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
                <h3 className="text-lg font-semibold">Bitácora rápida</h3>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="mt-3 w-full rounded-md border border-slate-700 bg-panelSoft p-2 text-sm" placeholder="Registrar incidencia, aprendizaje o acción tomada..." />
                <button onClick={saveNote} className="mt-2 w-full rounded-md bg-panelSoft px-3 py-2 text-sm">Guardar nota</button>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function TaskCard({ task, onChange }: { task: ChecklistTask; onChange: (taskId: string, patch: Partial<ChecklistTask>) => Promise<void> }) {
  return (
    <div className="rounded-md border border-slate-700 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={(e) =>
              onChange(task.id, {
                completed: e.target.checked,
                status: e.target.checked ? "hecho" : "pendiente",
                completedAt: e.target.checked ? new Date().toISOString().slice(0, 10) : null
              })
            }
            className="size-4 accent-accent"
          />
          <p className="font-medium">{task.title}</p>
        </div>
        <select
          value={task.status}
          onChange={(e) => onChange(task.id, { status: e.target.value as TaskStatus, completed: e.target.value === "hecho", completedAt: e.target.value === "hecho" ? new Date().toISOString().slice(0, 10) : null })}
          className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
        >
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En progreso</option>
          <option value="hecho">Hecho</option>
        </select>
      </div>
      <p className="mt-2 text-xs text-muted">
        Prioridad: {task.priority} | Estimado: {task.estimateHours}h | Completado: {task.completedAt ?? "N/A"}
      </p>
      <p className="mt-2 text-sm text-slate-200">Por qué importa: {task.why}</p>
      <p className="mt-1 text-sm text-slate-300">Cómo hacerlo: {task.how}</p>
      <p className="mt-1 text-sm text-slate-300">Ejemplo: {task.example}</p>
      <p className="mt-1 text-sm text-amber-300">Error común: {task.commonError}</p>
      <p className="mt-1 text-sm text-emerald-300">Acción recomendada: {task.action}</p>
      <textarea
        value={task.notes}
        onChange={(e) => void onChange(task.id, { notes: e.target.value })}
        rows={2}
        className="mt-2 w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-xs"
        placeholder="Notas..."
      />
    </div>
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

function QuickAmountButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-md bg-panelSoft px-3 py-2 text-xs text-slate-200 hover:bg-slate-700">
      {label}
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight, TrendingUp, TrendingDown, ClipboardList,
  DollarSign, BarChart3, ChevronRight, Plus, Loader2, X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { ensureCatalogAndProgress } from "@/lib/app-data";
import { ChecklistTask } from "@/lib/types";

type FinanceMonth = { sales: number; expenses: number };
type LatestKpi = { sales: number; expenses: number; tickets: number } | null;

const PAY_METHODS = ["efectivo", "tarjeta", "transferencia"];

function getWeekBounds(offsetWeeks = 0) {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day === 0 ? -6 : 1 - day) - offsetWeeks * 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().slice(0, 10),
    to: sunday.toISOString().slice(0, 10),
  };
}

export default function DashboardPage() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [finance, setFinance] = useState<FinanceMonth>({ sales: 0, expenses: 0 });
  const [weekSales, setWeekSales] = useState(0);
  const [prevWeekSales, setPrevWeekSales] = useState(0);
  const [latestKpi, setLatestKpi] = useState<LatestKpi>(null);
  const [prevKpi, setPrevKpi] = useState<LatestKpi>(null);
  const [loading, setLoading] = useState(true);

  // Quick sale form
  const [showQuick, setShowQuick] = useState(false);
  const [qAmount, setQAmount] = useState("");
  const [qMethod, setQMethod] = useState("efectivo");
  const [qBusy, setQBusy] = useState(false);
  const [qFeedback, setQFeedback] = useState("");

  useEffect(() => {
    if (!session?.user.id) return;
    void load(session.user.id);
  }, [session?.user.id]);

  async function load(userId: string) {
    if (!supabase) return;
    setLoading(true);

    const [hydratedTasks] = await Promise.all([ensureCatalogAndProgress(userId)]);
    setTasks(hydratedTasks);

    const monthStart = new Date();
    monthStart.setDate(1);
    const { data: finRows } = await supabase
      .from("finance_entries")
      .select("entry_type, amount, entry_date")
      .eq("user_id", userId)
      .gte("entry_date", monthStart.toISOString().slice(0, 10));

    const rows = finRows ?? [];
    const sales = rows.filter((r) => r.entry_type === "venta").reduce((a, c) => a + Number(c.amount), 0);
    const expenses = rows.filter((r) => r.entry_type === "gasto").reduce((a, c) => a + Number(c.amount), 0);
    setFinance({ sales, expenses });

    // Week comparison
    const thisWeek = getWeekBounds(0);
    const lastWeek = getWeekBounds(1);
    const thisWeekSales = rows
      .filter((r) => r.entry_type === "venta" && r.entry_date >= thisWeek.from && r.entry_date <= thisWeek.to)
      .reduce((a, c) => a + Number(c.amount), 0);
    const lastWeekSales = rows
      .filter((r) => r.entry_type === "venta" && r.entry_date >= lastWeek.from && r.entry_date <= lastWeek.to)
      .reduce((a, c) => a + Number(c.amount), 0);
    setWeekSales(thisWeekSales);
    setPrevWeekSales(lastWeekSales);

    const { data: kpis } = await supabase
      .from("kpis")
      .select("sales, expenses, tickets")
      .eq("user_id", userId)
      .order("period_month", { ascending: false })
      .limit(2);
    setLatestKpi((kpis?.[0] as LatestKpi) ?? null);
    setPrevKpi((kpis?.[1] as LatestKpi) ?? null);

    setLoading(false);
  }

  async function saveQuickSale() {
    if (!supabase || !session?.user.id || !qAmount) return;
    setQBusy(true);
    const { error } = await supabase.from("finance_entries").insert({
      user_id: session.user.id,
      entry_type: "venta",
      category: "venta_manual",
      amount: Number(qAmount),
      entry_date: new Date().toISOString().slice(0, 10),
      payment_method: qMethod,
      notes: "Registro rápido desde dashboard",
    });
    setQBusy(false);
    if (error) { setQFeedback(error.message); return; }
    setQFeedback(`✅ Venta de $${Number(qAmount).toLocaleString("es-MX")} registrada`);
    setQAmount("");
    setShowQuick(false);
    setTimeout(() => setQFeedback(""), 4000);
    await load(session.user.id);
  }

  const completed = tasks.filter((t) => t.completed).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const utility = finance.sales - finance.expenses;
  const margin = finance.sales > 0 ? Math.round((utility / finance.sales) * 100) : 0;
  const avgTicket =
    latestKpi && latestKpi.tickets > 0 ? Math.round(latestKpi.sales / latestKpi.tickets) : 0;
  const monthTrend =
    latestKpi && prevKpi && prevKpi.sales > 0
      ? Math.round(((latestKpi.sales - prevKpi.sales) / prevKpi.sales) * 100)
      : null;
  const weekTrend =
    prevWeekSales > 0
      ? Math.round(((weekSales - prevWeekSales) / prevWeekSales) * 100)
      : null;
  const healthScore = Math.max(
    0,
    Math.min(100, Math.round(progress * 0.6 + Math.max(margin, 0) * 0.4))
  );
  const nextTask = tasks.find((t) => !t.completed);

  const healthLabel =
    healthScore >= 70 ? "Buena salud" : healthScore >= 40 ? "En desarrollo" : "Necesita atención";
  const healthColor =
    healthScore >= 70 ? "text-success" : healthScore >= 40 ? "text-warning" : "text-red-400";

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-panel" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tu Dashboard</h1>
          <p className="mt-1 text-sm text-muted">El estado real de tu negocio, todo en un lugar.</p>
        </div>
        <button
          onClick={() => setShowQuick(!showQuick)}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-semibold text-white"
        >
          <Plus size={18} /> Venta rápida
        </button>
      </div>

      {/* Quick sale form */}
      {showQuick && (
        <div className="rounded-xl border border-slate-800 bg-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Registrar venta de hoy</h3>
            <button onClick={() => setShowQuick(false)} className="text-slate-500 hover:text-white">
              <X size={18} />
            </button>
          </div>
          <div className="flex gap-3">
            <input
              value={qAmount}
              onChange={(e) => setQAmount(e.target.value)}
              type="number"
              placeholder="Monto total $"
              className="flex-1 rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none focus:border-accent"
              autoFocus
            />
            <select
              value={qMethod}
              onChange={(e) => setQMethod(e.target.value)}
              className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none"
            >
              {PAY_METHODS.map((m) => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={() => void saveQuickSale()}
              disabled={qBusy || !qAmount}
              className="rounded-lg bg-accent px-4 py-2 font-semibold text-white disabled:opacity-50"
            >
              {qBusy ? <Loader2 className="animate-spin" size={16} /> : "Guardar"}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            Para detalle de productos ve a{" "}
            <Link href="/productos" className="text-accent underline">Mis Productos</Link> ·
            Para gastos ve a{" "}
            <Link href="/ventas" className="text-accent underline">Ventas y Gastos</Link>
          </p>
        </div>
      )}

      {qFeedback && (
        <div className="rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-emerald-300">
          {qFeedback}
        </div>
      )}

      {/* Progress hero */}
      <div className="rounded-xl border border-slate-800 bg-panel p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Progreso Sistema Base 21 días</p>
            <p className="mt-1 text-3xl font-bold">{progress}%</p>
            <p className="text-sm text-slate-300">
              {completed} de {tasks.length} tareas completadas
            </p>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${healthColor}`}>{healthLabel}</p>
            <p className="text-xs text-muted">Salud del negocio: {healthScore}/100</p>
          </div>
        </div>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-3 rounded-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress < 100 && nextTask && (
          <Link
            href="/checklist"
            className="mt-4 flex items-center justify-between rounded-lg bg-accent/10 p-3 text-sm text-amber-200 transition-colors hover:bg-accent/20"
          >
            <div>
              <p className="font-medium">Siguiente paso recomendado</p>
              <p className="text-xs text-slate-300">{nextTask.title}</p>
            </div>
            <ChevronRight size={18} />
          </Link>
        )}
        {progress === 100 && (
          <div className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-emerald-300">
            🎉 Sistema base completado. Revisa el Roadmap para el siguiente nivel.
          </div>
        )}
      </div>

      {/* Week comparison */}
      <div className="rounded-xl border border-slate-800 bg-panel p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Esta semana vs semana pasada</h2>
          <Link href="/ventas" className="flex items-center gap-1 text-xs text-accent hover:underline">
            Ver detalle <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted mb-1">Esta semana</p>
            <p className="text-2xl font-bold text-emerald-400">
              ${weekSales.toLocaleString("es-MX")}
            </p>
            {weekTrend !== null && (
              <p className={`mt-1 flex items-center gap-1 text-xs ${weekTrend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {weekTrend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {weekTrend >= 0 ? "+" : ""}{weekTrend}% vs semana pasada
              </p>
            )}
            {weekTrend === null && prevWeekSales === 0 && (
              <p className="mt-1 text-xs text-muted">Sin datos semana anterior</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Semana pasada</p>
            <p className="text-2xl font-bold text-slate-400">
              ${prevWeekSales.toLocaleString("es-MX")}
            </p>
          </div>
        </div>
        {weekSales === 0 && (
          <div className="mt-3 text-xs text-muted">
            Registra ventas esta semana para ver la comparación.
          </div>
        )}
      </div>

      {/* Finance cards */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Finanzas de este mes</h2>
          <Link href="/ventas" className="flex items-center gap-1 text-xs text-accent hover:underline">
            Ver detalle <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            title="Ventas"
            value={`$${finance.sales.toLocaleString("es-MX")}`}
            sub="este mes"
            icon={<TrendingUp size={16} />}
            color="text-success"
          />
          <MetricCard
            title="Gastos"
            value={`$${finance.expenses.toLocaleString("es-MX")}`}
            sub="este mes"
            icon={<TrendingDown size={16} />}
            color="text-red-400"
          />
          <MetricCard
            title="Ganancia"
            value={`$${utility.toLocaleString("es-MX")}`}
            sub={`margen ${margin}%`}
            icon={utility >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            color={utility >= 0 ? "text-success" : "text-red-400"}
          />
          <MetricCard
            title="Ticket promedio"
            value={avgTicket ? `$${avgTicket.toLocaleString("es-MX")}` : "Sin datos"}
            sub="último mes KPI"
            icon={<BarChart3 size={16} />}
            color="text-accent"
          />
        </div>
        {finance.sales === 0 && (
          <div className="mt-3 rounded-lg border border-slate-700 bg-panelSoft p-3 text-sm">
            <p className="font-medium">¿Aún no registras ventas?</p>
            <p className="mt-1 text-xs text-muted">
              Registrar tus ventas diarias es el primer paso para saber si tu negocio es rentable.
            </p>
            <button
              onClick={() => setShowQuick(true)}
              className="mt-2 inline-flex items-center gap-1 text-xs text-accent"
            >
              Registrar primera venta <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Month trend */}
      {monthTrend !== null && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-4 text-sm ${
            monthTrend >= 0
              ? "border-success/30 bg-success/5 text-emerald-300"
              : "border-red-500/30 bg-red-500/5 text-red-300"
          }`}
        >
          {monthTrend >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          <p>
            {monthTrend >= 0
              ? `Ventas subieron ${monthTrend}% vs el mes anterior. ¡Buen trabajo!`
              : `Ventas bajaron ${Math.abs(monthTrend)}% vs el mes anterior. Revisa qué pasó.`}
          </p>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 font-semibold">Accesos rápidos</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickLink href="/ventas" icon={<DollarSign size={20} />} label="Ventas y Gastos" />
          <QuickLink href="/checklist" icon={<ClipboardList size={20} />} label="Ver checklist" />
          <QuickLink href="/kpis" icon={<BarChart3 size={20} />} label="Actualizar KPIs" />
          <QuickLink href="/roadmap" icon={<TrendingUp size={20} />} label="Ver roadmap" />
        </div>
      </div>

      {/* Tutorial tip */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm">
        <p className="font-semibold text-accent">💡 ¿Cómo usar esta app?</p>
        <p className="mt-2 text-slate-300">
          Empieza por el <strong>Sistema 21 días</strong> — es tu guía paso a paso. Cada tarea te
          explica qué hacer y por qué importa. No necesitas saber de finanzas: la app te enseña
          mientras avanzas.
        </p>
        <Link href="/checklist" className="mt-3 inline-flex items-center gap-1 font-medium text-accent">
          Empezar ahora <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function MetricCard({
  title, value, sub, icon, color,
}: {
  title: string; value: string; sub: string; icon: React.ReactNode; color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-panel p-4">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <p className="text-xs text-muted">{title}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  );
}

function QuickLink({
  href, icon, label,
}: {
  href: Route<string>; icon: React.ReactNode; label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-panel p-4 text-center text-sm text-slate-300 transition-colors hover:border-accent/40 hover:text-white"
    >
      <span className="text-accent">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

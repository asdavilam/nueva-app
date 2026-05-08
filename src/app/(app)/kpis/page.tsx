"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

type KpiRow = { id: string; period_month: string; sales: number; expenses: number; customers: number; tickets: number };

function currentYearMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function daysElapsedInMonth(yearMonth: string): number {
  const [year, month] = yearMonth.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const now = new Date();
  const currentYM = currentYearMonth();
  if (yearMonth === currentYM) return now.getDate();
  return lastDay;
}

export default function KpisPage() {
  const { session } = useAuth();
  const [rows, setRows] = useState<KpiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [autoFilled, setAutoFilled] = useState(false);
  const [expensesByCategory, setExpensesByCategory] = useState<Record<string, number>>({});

  const [form, setForm] = useState({
    periodMonth: currentYearMonth(),
    sales: "",
    expenses: "",
    customers: "",
    tickets: "",
  });

  useEffect(() => {
    if (!session?.user.id) return;
    void load(session.user.id);
  }, [session?.user.id]);

  // Auto-load from finance_entries when month changes
  useEffect(() => {
    if (!session?.user.id || !form.periodMonth) return;
    void autoLoad(session.user.id, form.periodMonth);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.periodMonth, session?.user.id]);

  async function load(userId: string) {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from("kpis")
      .select("id, period_month, sales, expenses, customers, tickets")
      .eq("user_id", userId)
      .order("period_month", { ascending: false })
      .limit(12);
    setRows((data ?? []) as KpiRow[]);
    setLoading(false);
  }

  async function autoLoad(userId: string, yearMonth: string) {
    if (!supabase) return;
    setAutoLoading(true);
    setAutoFilled(false);

    const from = `${yearMonth}-01`;
    const [year, month] = yearMonth.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${yearMonth}-${String(lastDay).padStart(2, "0")}`;

    const { data: entries } = await supabase
      .from("finance_entries")
      .select("entry_type, amount, category")
      .eq("user_id", userId)
      .gte("entry_date", from)
      .lte("entry_date", to);

    setAutoLoading(false);

    if (!entries || entries.length === 0) {
      setExpensesByCategory({});
      return;
    }

    const gastos = entries.filter((e) => e.entry_type === "gasto");
    const sales = +entries
      .filter((e) => e.entry_type === "venta")
      .reduce((a, c) => a + Number(c.amount), 0)
      .toFixed(2);
    const expenses = +gastos.reduce((a, c) => a + Number(c.amount), 0).toFixed(2);
    const tickets = entries.filter((e) => e.entry_type === "venta").length;

    const byCategory = gastos.reduce<Record<string, number>>((acc, e) => {
      const cat = (e.category as string) || "otro";
      acc[cat] = (acc[cat] || 0) + Number(e.amount);
      return acc;
    }, {});
    setExpensesByCategory(byCategory);

    setForm((prev) => ({
      ...prev,
      sales: sales > 0 ? String(sales) : prev.sales,
      expenses: expenses > 0 ? String(expenses) : prev.expenses,
      tickets: tickets > 0 ? String(tickets) : prev.tickets,
    }));
    setAutoFilled(true);
  }

  async function save() {
    if (!supabase || !session?.user.id || !form.periodMonth) return;
    setBusy(true);
    const { error } = await supabase.from("kpis").upsert(
      {
        user_id: session.user.id,
        period_month: `${form.periodMonth}-01`,
        sales: Number(form.sales || 0),
        expenses: Number(form.expenses || 0),
        customers: Number(form.customers || 0),
        tickets: Number(form.tickets || 0),
      },
      { onConflict: "user_id,period_month" }
    );
    setBusy(false);
    if (error) { setFeedback(error.message); return; }
    setFeedback("KPIs guardados correctamente.");
    setTimeout(() => setFeedback(""), 3000);
    await load(session.user.id);
  }

  const latest = rows[0];
  const prev = rows[1];
  const avgTicket = latest?.tickets > 0 ? Math.round(latest.sales / latest.tickets) : 0;
  const margin = latest?.sales > 0 ? Math.round(((latest.sales - latest.expenses) / latest.sales) * 100) : 0;
  const salesTrend =
    latest && prev && prev.sales > 0
      ? Math.round(((latest.sales - prev.sales) / prev.sales) * 100)
      : null;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">KPIs del negocio</h1>
        <p className="mt-1 text-sm text-muted">Los indicadores clave que te dicen si tu negocio está creciendo.</p>
      </div>

      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm">
        <p className="font-semibold text-accent">¿Qué son los KPIs?</p>
        <p className="mt-1 text-slate-300">
          KPI significa "indicador clave de rendimiento". Son números que te ayudan a tomar decisiones con datos, no con intuición.
          Aquí aparece el resumen ejecutivo de cada mes: ventas, gastos, margen y ticket promedio.
        </p>
        <p className="mt-2 text-xs text-muted">
          💡 Los campos de ventas, gastos y tickets se cargan automáticamente desde tus registros de Ventas y Gastos.
          Solo necesitas ingresar cuántos clientes atendiste.
        </p>
      </div>

      {/* Latest metrics */}
      {latest && (
        <div>
          <p className="mb-3 text-sm font-medium text-muted">
            Último período:{" "}
            {new Date(latest.period_month + "T12:00:00").toLocaleDateString("es-MX", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiMetric
              label="Ticket promedio"
              value={avgTicket ? `$${avgTicket.toLocaleString("es-MX")}` : "N/A"}
              detail="por ticket"
              good={avgTicket > 80}
            />
            <KpiMetric
              label="Margen neto"
              value={`${margin}%`}
              detail={margin >= 15 ? "saludable" : margin >= 5 ? "ajustado" : "crítico"}
              good={margin >= 15}
            />
            <KpiMetric
              label="Ventas del período"
              value={`$${latest.sales.toLocaleString("es-MX")}`}
              detail={`${latest.tickets} tickets`}
              good={null}
            />
            <KpiMetric
              label="Tendencia ventas"
              value={salesTrend !== null ? `${salesTrend > 0 ? "+" : ""}${salesTrend}%` : "N/A"}
              detail="vs mes anterior"
              good={salesTrend !== null ? salesTrend >= 0 : null}
              trend={salesTrend}
            />
          </div>

          {margin < 10 && margin > 0 && (
            <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300">
              <p className="font-semibold">⚠️ Margen por debajo del 10%</p>
              <p className="mt-1 text-xs">
                De cada $100 que vendes, solo te quedan ${margin} de ganancia. Revisa si tus precios son correctos o si hay gastos que puedas reducir.
              </p>
            </div>
          )}
          {margin >= 20 && (
            <div className="mt-3 rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-emerald-300">
              <p className="font-semibold">✅ Buen margen de {margin}%</p>
              <p className="mt-1 text-xs">Estás en rango saludable para un restaurante. Sigue monitoreando que no baje.</p>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <div className="rounded-xl border border-slate-800 bg-panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Registrar / actualizar KPIs</h3>
          {autoLoading && (
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <Loader2 size={12} className="animate-spin" /> Cargando datos...
            </span>
          )}
          {autoFilled && !autoLoading && (
            <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">
              <Zap size={12} /> Auto-calculado
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-muted">Mes *</label>
            <input
              value={form.periodMonth}
              onChange={(e) => setForm((p) => ({ ...p, periodMonth: e.target.value }))}
              type="month"
              className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          <AutoField
            label="Ventas totales del mes"
            value={form.sales}
            onChange={(v) => setForm((p) => ({ ...p, sales: v }))}
            auto={autoFilled}
            placeholder="$0"
          />
          <AutoField
            label="Gastos totales del mes"
            value={form.expenses}
            onChange={(v) => setForm((p) => ({ ...p, expenses: v }))}
            auto={autoFilled}
            placeholder="$0"
          />
          <AutoField
            label="Número de tickets (órdenes)"
            value={form.tickets}
            onChange={(v) => setForm((p) => ({ ...p, tickets: v }))}
            auto={autoFilled}
            placeholder="0"
          />

          <div>
            <label className="mb-1 block text-xs text-muted">
              Clientes atendidos{" "}
              <span className="text-slate-500">(ingresa manualmente)</span>
            </label>
            <input
              value={form.customers}
              onChange={(e) => setForm((p) => ({ ...p, customers: e.target.value }))}
              type="number"
              placeholder="0"
              className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Derived preview */}
        {form.sales && form.tickets && Number(form.tickets) > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-700 bg-panelSoft p-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted">Ticket promedio</p>
              <p className="font-bold text-accent">
                ${Math.round(Number(form.sales) / Number(form.tickets)).toLocaleString("es-MX")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Margen estimado</p>
              <p className={`font-bold ${Number(form.sales) > 0 && ((Number(form.sales) - Number(form.expenses || 0)) / Number(form.sales)) >= 0.15 ? "text-success" : "text-red-400"}`}>
                {Number(form.sales) > 0
                  ? `${Math.round(((Number(form.sales) - Number(form.expenses || 0)) / Number(form.sales)) * 100)}%`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Ganancia estimada</p>
              <p className={`font-bold ${Number(form.sales) - Number(form.expenses || 0) >= 0 ? "text-success" : "text-red-400"}`}>
                ${(Number(form.sales) - Number(form.expenses || 0)).toLocaleString("es-MX")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Tickets por día</p>
              <p className="font-bold">
                ~{Math.round(Number(form.tickets) / daysElapsedInMonth(form.periodMonth))}
              </p>
              <p className="text-xs text-muted">{form.tickets} total</p>
            </div>
          </div>
        )}

        <button
          onClick={() => void save()}
          disabled={busy || !form.periodMonth}
          className="mt-4 flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {busy ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Guardar KPIs
        </button>
        {feedback && <p className="mt-3 text-sm text-emerald-400">{feedback}</p>}
      </div>

      {/* Costo operativo */}
      {Object.keys(expensesByCategory).length > 0 && (
        <CostoOperativo
          byCategory={expensesByCategory}
          totalExpenses={Number(form.expenses || 0)}
          totalSales={Number(form.sales || 0)}
          periodMonth={form.periodMonth}
        />
      )}

      {/* History */}
      {rows.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold">Historial (últimos 12 meses)</h3>
          <div className="space-y-2">
            {rows.map((row, i) => {
              const rMargin =
                row.sales > 0 ? Math.round(((row.sales - row.expenses) / row.sales) * 100) : 0;
              const rTicket = row.tickets > 0 ? Math.round(row.sales / row.tickets) : 0;
              const prevRow = rows[i + 1];
              const trend =
                prevRow && prevRow.sales > 0
                  ? Math.round(((row.sales - prevRow.sales) / prevRow.sales) * 100)
                  : null;
              return (
                <div
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-panel px-4 py-3 text-sm"
                >
                  <p className="font-medium capitalize">
                    {new Date(row.period_month + "T12:00:00").toLocaleDateString("es-MX", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted">
                    <span className="font-medium text-emerald-400">
                      ${row.sales.toLocaleString("es-MX")}
                    </span>
                    <span>Gastos: ${row.expenses.toLocaleString("es-MX")}</span>
                    <span>Margen: {rMargin}%</span>
                    <span>Ticket: ${rTicket.toLocaleString("es-MX")}</span>
                    {trend !== null && (
                      <span className={trend >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CostoOperativo({
  byCategory, totalExpenses, totalSales, periodMonth,
}: {
  byCategory: Record<string, number>;
  totalExpenses: number;
  totalSales: number;
  periodMonth: string;
}) {
  const resultado = totalSales - totalExpenses;
  const sorted = Object.entries(byCategory).sort(([, a], [, b]) => b - a);
  const hasNomina = "nómina" in byCategory;

  return (
    <div className="rounded-xl border border-slate-800 bg-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Costo operativo mensual</h3>
          <p className="text-xs text-muted capitalize">
            {new Date(periodMonth + "-01T12:00:00").toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${resultado >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
          {resultado >= 0 ? "+" : ""}${resultado.toLocaleString("es-MX")}
        </span>
      </div>

      <div className="space-y-1.5">
        {sorted.map(([cat, amt]) => (
          <div key={cat} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-slate-600" />
              <span className="capitalize text-slate-300">{cat}</span>
            </div>
            <span className="font-medium text-red-400">−${amt.toLocaleString("es-MX")}</span>
          </div>
        ))}
        <div className="mt-3 border-t border-slate-700 pt-3">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-muted">Total gastos</span>
            <span className="text-red-400">−${totalExpenses.toLocaleString("es-MX")}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm font-semibold">
            <span className="text-muted">Ventas</span>
            <span className="text-emerald-400">+${totalSales.toLocaleString("es-MX")}</span>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-panelSoft px-3 py-2 text-sm font-bold">
            <span>Resultado</span>
            <span className={resultado >= 0 ? "text-emerald-400" : "text-red-400"}>
              {resultado >= 0 ? "+" : ""}${resultado.toLocaleString("es-MX")}
            </span>
          </div>
        </div>
      </div>

      {!hasNomina && (
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-300">
          <p className="font-semibold">⚠️ No hay gastos de nómina registrados</p>
          <p className="mt-0.5 text-amber-400/80">
            Si no incluyes tu propio sueldo como gasto, el resultado real es menor de lo que aparece aquí.
          </p>
        </div>
      )}

      {resultado < 0 && (
        <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs text-red-300">
          <p className="font-semibold">🔴 Gastos superan ventas este mes</p>
          <p className="mt-0.5 text-red-400/80">
            Necesitas vender ${Math.abs(resultado).toLocaleString("es-MX")} más para cubrir tus costos. Revisa qué categoría pesa más.
          </p>
        </div>
      )}
    </div>
  );
}

function AutoField({
  label, value, onChange, auto, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; auto: boolean; placeholder: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-xs text-muted">{label}</label>
        {auto && (
          <span className="flex items-center gap-0.5 text-[10px] text-accent">
            <Zap size={10} /> auto
          </span>
        )}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type="number"
        placeholder={placeholder}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-accent ${
          auto ? "border-accent/40 bg-accent/5" : "border-slate-700 bg-panelSoft"
        }`}
      />
    </div>
  );
}

function KpiMetric({
  label, value, detail, good, trend,
}: {
  label: string; value: string; detail: string; good: boolean | null; trend?: number | null;
}) {
  const valueColor = good === null ? "text-white" : good ? "text-success" : "text-red-400";
  return (
    <div className="rounded-xl border border-slate-800 bg-panel p-4">
      <p className="text-xs text-muted">{label}</p>
      <div className="mt-1 flex items-center gap-1">
        {trend !== undefined && trend !== null && (
          trend >= 0 ? (
            <TrendingUp size={14} className="text-success" />
          ) : (
            <TrendingDown size={14} className="text-red-400" />
          )
        )}
        <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
      </div>
      <p className="text-xs text-slate-400">{detail}</p>
    </div>
  );
}

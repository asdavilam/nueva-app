"use client";

import { useEffect, useState } from "react";
import { Plus, TrendingUp, TrendingDown, Loader2, Trash2, CalendarDays } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

type Entry = {
  id: string;
  entry_type: "venta" | "gasto";
  category: string;
  amount: number;
  entry_date: string;
  payment_method: string | null;
  notes: string;
};

const GASTO_CATS = ["insumos", "nómina", "renta", "servicios", "mantenimiento", "empaques", "marketing", "otro"];
const PAY_METHODS = ["efectivo", "tarjeta", "transferencia"];

export default function VentasPage() {
  const { session } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"venta" | "gasto">("venta");
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  // Form state
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("venta_manual");
  const [payMethod, setPayMethod] = useState("efectivo");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!session?.user.id) return;
    void load(session.user.id);
  }, [session?.user.id]);

  async function load(userId: string) {
    if (!supabase) return;
    setLoading(true);
    const monthStart = new Date();
    monthStart.setDate(1);
    const { data } = await supabase
      .from("finance_entries")
      .select("id, entry_type, category, amount, entry_date, payment_method, notes")
      .eq("user_id", userId)
      .gte("entry_date", monthStart.toISOString().slice(0, 10))
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });
    setEntries((data ?? []) as Entry[]);
    setLoading(false);
  }

  async function save() {
    if (!supabase || !session?.user.id || !amount) return;
    setBusy(true);
    const { error } = await supabase.from("finance_entries").insert({
      user_id: session.user.id,
      entry_type: tab,
      category: tab === "venta" ? "venta_manual" : category,
      amount: Number(amount),
      entry_date: date,
      payment_method: payMethod,
      notes: note
    });
    setBusy(false);
    if (error) { setFeedback(error.message); return; }
    setFeedback(`${tab === "venta" ? "Venta" : "Gasto"} de $${Number(amount).toLocaleString("es-MX")} guardado.`);
    setAmount(""); setNote("");
    setShowForm(false);
    setTimeout(() => setFeedback(""), 3000);
    await load(session.user.id);
  }

  async function remove(id: string) {
    if (!supabase || !session?.user.id) return;
    await supabase.from("finance_entries").delete().eq("id", id).eq("user_id", session.user.id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const filtered = entries.filter((e) => e.entry_type === tab);
  const totalVentas = entries.filter((e) => e.entry_type === "venta").reduce((a, c) => a + c.amount, 0);
  const totalGastos = entries.filter((e) => e.entry_type === "gasto").reduce((a, c) => a + c.amount, 0);
  const utilidad = totalVentas - totalGastos;

  const byDate = filtered.reduce<Record<string, Entry[]>>((acc, e) => {
    if (!acc[e.entry_date]) acc[e.entry_date] = [];
    acc[e.entry_date].push(e);
    return acc;
  }, {});

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-accent" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ventas y Gastos</h1>
          <p className="mt-1 text-sm text-muted">Registra cada movimiento de dinero de tu negocio.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-semibold text-white"
        >
          <Plus size={18} /> Registrar
        </button>
      </div>

      {/* Tutorial tip */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm">
        <p className="font-semibold text-accent">¿Qué registrar aquí?</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 text-slate-300">
          <div>
            <p className="font-medium text-emerald-400">Ventas:</p>
            <p className="text-xs">Todo el dinero que entra al negocio. Regístralo cada vez que cierres el día o después de cada turno.</p>
          </div>
          <div>
            <p className="font-medium text-red-400">Gastos:</p>
            <p className="text-xs">Todo lo que pagas: insumos, nómina, renta, servicios. Guarda el ticket y regístralo el mismo día.</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <TrendingUp size={16} className="text-emerald-400 mb-1" />
          <p className="text-xs text-muted">Ventas del mes</p>
          <p className="mt-1 text-xl font-bold text-emerald-400">${totalVentas.toLocaleString("es-MX")}</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <TrendingDown size={16} className="text-red-400 mb-1" />
          <p className="text-xs text-muted">Gastos del mes</p>
          <p className="mt-1 text-xl font-bold text-red-400">${totalGastos.toLocaleString("es-MX")}</p>
        </div>
        <div className={`rounded-xl border p-4 ${utilidad >= 0 ? "border-accent/20 bg-accent/5" : "border-red-500/20 bg-red-500/5"}`}>
          <p className="text-xs text-muted">Ganancia</p>
          <p className={`mt-1 text-xl font-bold ${utilidad >= 0 ? "text-accent" : "text-red-400"}`}>
            ${utilidad.toLocaleString("es-MX")}
          </p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-slate-800 bg-panel p-5">
          <h3 className="mb-4 font-semibold">Nuevo registro</h3>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setTab("venta")}
              className={`rounded-lg py-2 text-sm font-medium ${tab === "venta" ? "bg-emerald-500/20 text-emerald-300" : "bg-panelSoft text-slate-400"}`}
            >
              Venta
            </button>
            <button
              onClick={() => setTab("gasto")}
              className={`rounded-lg py-2 text-sm font-medium ${tab === "gasto" ? "bg-red-500/20 text-red-300" : "bg-panelSoft text-slate-400"}`}
            >
              Gasto
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted">Monto *</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                placeholder="$0.00"
                className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            {tab === "gasto" && (
              <div>
                <label className="mb-1 block text-xs text-muted">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none"
                >
                  {GASTO_CATS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted">Método de pago</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none"
                >
                  {PAY_METHODS.map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Fecha</label>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  type="date"
                  className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">Nota (opcional)</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: compra carne Don Chuy, turno tarde..."
                className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            <button
              onClick={() => void save()}
              disabled={busy || !amount}
              className="w-full rounded-lg bg-accent py-2.5 font-semibold text-white disabled:opacity-50"
            >
              {busy ? <Loader2 className="mx-auto animate-spin" size={18} /> : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <div className="rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-emerald-300">
          {feedback}
        </div>
      )}

      {/* List */}
      <div>
        <div className="mb-3 flex gap-2">
          <button
            onClick={() => setTab("venta")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === "venta" ? "bg-emerald-500/20 text-emerald-300" : "bg-panelSoft text-slate-400"}`}
          >
            Ventas ({entries.filter((e) => e.entry_type === "venta").length})
          </button>
          <button
            onClick={() => setTab("gasto")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === "gasto" ? "bg-red-500/20 text-red-300" : "bg-panelSoft text-slate-400"}`}
          >
            Gastos ({entries.filter((e) => e.entry_type === "gasto").length})
          </button>
        </div>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-panel p-8 text-center text-muted">
            <p>No hay {tab === "venta" ? "ventas" : "gastos"} registrados este mes.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-accent">
              Registrar primero →
            </button>
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(byDate)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, dayEntries]) => {
              const dayTotal = dayEntries.reduce((a, c) => a + c.amount, 0);
              return (
                <div key={date} className="rounded-xl border border-slate-800 bg-panel overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-800 bg-panelSoft px-4 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays size={14} className="text-muted" />
                      <span className="font-medium">{new Date(date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}</span>
                    </div>
                    <span className={`text-sm font-semibold ${tab === "venta" ? "text-emerald-400" : "text-red-400"}`}>
                      ${dayTotal.toLocaleString("es-MX")}
                    </span>
                  </div>
                  {dayEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between px-4 py-3 text-sm border-b border-slate-800/50 last:border-0">
                      <div>
                        <p className="font-medium capitalize">{entry.category.replace("_", " ")}</p>
                        <div className="mt-0.5 flex gap-2 text-xs text-muted">
                          {entry.payment_method && <span className="capitalize">{entry.payment_method}</span>}
                          {entry.notes && <span>· {entry.notes}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${tab === "venta" ? "text-emerald-400" : "text-red-400"}`}>
                          ${Number(entry.amount).toLocaleString("es-MX")}
                        </span>
                        <button onClick={() => void remove(entry.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

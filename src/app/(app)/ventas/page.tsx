"use client";

import { useEffect, useState } from "react";
import { Plus, TrendingUp, TrendingDown, Loader2, Trash2, CalendarDays, ShoppingBag } from "lucide-react";
import Link from "next/link";
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
const PAY_METHODS = ["efectivo", "tarjeta", "transferencia"] as const;

export default function VentasPage() {
  const { session } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("insumos");
  const [payMethod, setPayMethod] = useState<typeof PAY_METHODS[number]>("efectivo");
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
      entry_type: "gasto",
      category,
      amount: Number(amount),
      entry_date: date,
      payment_method: payMethod,
      notes: note,
    });
    setBusy(false);
    if (error) { setFeedback(error.message); return; }
    setFeedback(`Gasto de $${Number(amount).toLocaleString("es-MX")} guardado.`);
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

  const totalVentas = entries.filter((e) => e.entry_type === "venta").reduce((a, c) => a + c.amount, 0);
  const totalGastos = entries.filter((e) => e.entry_type === "gasto").reduce((a, c) => a + c.amount, 0);
  const utilidad = totalVentas - totalGastos;
  const gastos = entries.filter((e) => e.entry_type === "gasto");

  const byDate = gastos.reduce<Record<string, Entry[]>>((acc, e) => {
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
          <h1 className="text-2xl font-bold">Gastos</h1>
          <p className="mt-1 text-sm text-muted">Registra todo lo que pagas para operar el negocio.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-semibold text-white"
        >
          <Plus size={18} /> Nuevo gasto
        </button>
      </div>

      {/* Ventas redirect banner */}
      <Link
        href="/productos"
        className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-colors hover:bg-emerald-500/10"
      >
        <div className="flex items-center gap-3">
          <ShoppingBag size={20} className="text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">¿Quieres registrar una venta?</p>
            <p className="text-xs text-muted">Ve a Mis Productos → Registrar Ticket para seleccionar qué vendiste.</p>
          </div>
        </div>
        <span className="text-xs text-emerald-400">Ir →</span>
      </Link>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <TrendingUp size={16} className="mb-1 text-emerald-400" />
          <p className="text-xs text-muted">Ventas del mes</p>
          <p className="mt-1 text-xl font-bold text-emerald-400">${totalVentas.toLocaleString("es-MX")}</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <TrendingDown size={16} className="mb-1 text-red-400" />
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
          <h3 className="mb-4 font-semibold">Registrar gasto</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted">Monto *</label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  placeholder="$0.00"
                  className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none focus:border-accent"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none"
                >
                  {GASTO_CATS.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Payment method — button grid */}
            <div>
              <label className="mb-2 block text-xs text-muted">Método de pago</label>
              <div className="grid grid-cols-3 gap-2">
                {PAY_METHODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setPayMethod(m)}
                    className={`rounded-lg py-2.5 text-sm font-medium capitalize transition-colors ${
                      payMethod === m
                        ? "bg-accent/20 text-accent ring-1 ring-accent/40"
                        : "bg-panelSoft text-slate-400 hover:text-white"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
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

            <div>
              <label className="mb-1 block text-xs text-muted">Nota (opcional)</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: compra carne Don Chuy, pago renta mensual..."
                className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => void save()}
                disabled={busy || !amount}
                className="flex-1 rounded-lg bg-accent py-2.5 font-semibold text-white disabled:opacity-50"
              >
                {busy ? <Loader2 className="mx-auto animate-spin" size={18} /> : "Guardar gasto"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <div className="rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-emerald-300">
          {feedback}
        </div>
      )}

      {/* Gastos list */}
      <div>
        <h2 className="mb-3 font-semibold">
          Gastos del mes <span className="text-sm font-normal text-muted">({gastos.length})</span>
        </h2>

        {gastos.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-panel p-8 text-center text-muted">
            <p>No hay gastos registrados este mes.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-accent">
              Registrar primero →
            </button>
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(byDate)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([d, dayEntries]) => {
              const dayTotal = dayEntries.reduce((a, c) => a + c.amount, 0);
              return (
                <div key={d} className="overflow-hidden rounded-xl border border-slate-800 bg-panel">
                  <div className="flex items-center justify-between border-b border-slate-800 bg-panelSoft px-4 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays size={14} className="text-muted" />
                      <span className="font-medium">
                        {new Date(d + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-red-400">${dayTotal.toLocaleString("es-MX")}</span>
                  </div>
                  {dayEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between border-b border-slate-800/50 px-4 py-3 text-sm last:border-0">
                      <div>
                        <p className="font-medium capitalize">{entry.category.replace("_", " ")}</p>
                        <div className="mt-0.5 flex gap-2 text-xs text-muted">
                          {entry.payment_method && <span className="capitalize">{entry.payment_method}</span>}
                          {entry.notes && <span>· {entry.notes}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-red-400">
                          ${Number(entry.amount).toLocaleString("es-MX")}
                        </span>
                        <button
                          onClick={() => void remove(entry.id)}
                          className="text-slate-600 transition-colors hover:text-red-400"
                        >
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

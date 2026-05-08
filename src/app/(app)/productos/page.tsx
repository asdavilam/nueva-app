"use client";

import { useEffect, useState } from "react";
import {
  Plus, ShoppingBag, Loader2, Trash2, ChevronDown,
  Star, BarChart3, Package, Minus, CheckCircle2, Receipt, Pencil, X, Check,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import type { Product, ProductVariant, SaleItem } from "@/lib/types";

type ProductWithVariants = Product & { variants: ProductVariant[] };
type ProductReport = { product_id: string; name: string; category: string; qty: number };
type LineItem = { lid: string; productId: string; variantId: string | null; qty: number };
type VentaEntry = { id: string; amount: number; entry_date: string; payment_method: string | null; notes: string };

const PRODUCT_CATS = ["burger", "acompañamiento", "bebida", "postre", "combo", "otro"];
const PAY_METHODS = ["efectivo", "tarjeta", "transferencia"] as const;
const CARD_COMMISSION = 0.0406;

let lidCounter = 0;
function newLid() { return `lid-${++lidCounter}`; }

export default function ProductosPage() {
  const { session } = useAuth();
  const [tab, setTab] = useState<"catalogo" | "venta" | "analisis">("catalogo");
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [ventas, setVentas] = useState<VentaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  // ── Catálogo ──
  const [showProductForm, setShowProductForm] = useState(false);
  const [pName, setPName] = useState("");
  const [pCat, setPCat] = useState("burger");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [vName, setVName] = useState("");

  // ── Ticket ──
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [fixedCosts, setFixedCosts] = useState("");

  // ── Edit ticket ──
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editPayMethod, setEditPayMethod] = useState<typeof PAY_METHODS[number]>("efectivo");
  const [ticketTotal, setTicketTotal] = useState("");
  const [payMethod, setPayMethod] = useState<typeof PAY_METHODS[number]>("efectivo");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!session?.user.id) return;
    void load(session.user.id);
  }, [session?.user.id]);

  async function load(userId: string) {
    if (!supabase) return;
    setLoading(true);

    const { data: prods } = await supabase
      .from("products")
      .select("id, user_id, name, category, base_price, active, created_at, product_variants(id, product_id, name, price_adjustment)")
      .eq("user_id", userId)
      .eq("active", true)
      .order("created_at", { ascending: true });

    const monthStart = new Date();
    monthStart.setDate(1);

    const { data: salesData } = await supabase
      .from("sale_items")
      .select("id, user_id, product_id, variant_id, finance_entry_id, quantity, unit_price, sale_date, created_at")
      .eq("user_id", userId)
      .gte("sale_date", monthStart.toISOString().slice(0, 10))
      .order("sale_date", { ascending: false });

    const { data: ventasData } = await supabase
      .from("finance_entries")
      .select("id, amount, entry_date, payment_method, notes")
      .eq("user_id", userId)
      .eq("entry_type", "venta")
      .gte("entry_date", monthStart.toISOString().slice(0, 10))
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });

    setProducts(
      (prods ?? []).map((p) => ({
        ...(p as unknown as Product),
        variants: ((p as Record<string, unknown>).product_variants as ProductVariant[]) ?? [],
      }))
    );
    setSales((salesData ?? []) as SaleItem[]);
    setVentas((ventasData ?? []) as VentaEntry[]);
    setLoading(false);
  }

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 4000);
  }

  async function createProduct() {
    if (!supabase || !session?.user.id || !pName) return;
    setBusy(true);
    const { error } = await supabase.from("products").insert({
      user_id: session.user.id, name: pName, category: pCat, base_price: 0,
    });
    setBusy(false);
    if (error) { showFeedback(error.message); return; }
    setPName(""); setShowProductForm(false);
    showFeedback("Producto creado");
    await load(session.user.id);
  }

  async function addVariant(productId: string) {
    if (!supabase || !session?.user.id || !vName) return;
    const { error } = await supabase.from("product_variants").insert({
      product_id: productId, name: vName, price_adjustment: 0,
    });
    if (error) { showFeedback(error.message); return; }
    setVName("");
    showFeedback("Variante agregada");
    await load(session.user.id);
  }

  async function deleteProduct(id: string) {
    if (!supabase || !session?.user.id) return;
    await supabase.from("products").update({ active: false }).eq("id", id).eq("user_id", session.user.id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showFeedback("Producto eliminado");
  }

  async function deleteVariant(variantId: string, productId: string) {
    if (!supabase) return;
    await supabase.from("product_variants").delete().eq("id", variantId);
    setProducts((prev) =>
      prev.map((p) => p.id === productId
        ? { ...p, variants: p.variants.filter((v) => v.id !== variantId) }
        : p
      )
    );
  }

  // ── Line items ──
  function addToLineItems(productId: string) {
    setLineItems((prev) => {
      // Increment existing same-product item with no variant picked
      const existing = prev.findIndex((li) => li.productId === productId && li.variantId === null);
      if (existing >= 0) {
        return prev.map((li, i) => i === existing ? { ...li, qty: li.qty + 1 } : li);
      }
      return [...prev, { lid: newLid(), productId, variantId: null, qty: 1 }];
    });
  }

  function setLineItemVariant(lid: string, variantId: string) {
    setLineItems((prev) =>
      prev.map((li) =>
        li.lid === lid
          ? { ...li, variantId: li.variantId === variantId ? null : variantId }
          : li
      )
    );
  }

  function changeLineItemQty(lid: string, delta: number) {
    setLineItems((prev) => {
      const next = prev.map((li) => li.lid === lid ? { ...li, qty: li.qty + delta } : li);
      return next.filter((li) => li.qty > 0);
    });
  }

  function removeLineItem(lid: string) {
    setLineItems((prev) => prev.filter((li) => li.lid !== lid));
  }

  // Commission calc
  const grossAmount = Number(ticketTotal) || 0;
  const commissionAmt = payMethod === "tarjeta" ? +(grossAmount * CARD_COMMISSION).toFixed(2) : 0;
  const netAmount = +(grossAmount - commissionAmt).toFixed(2);

  async function registerTicket() {
    if (!supabase || !session?.user.id) return;
    if (lineItems.length === 0 || !ticketTotal) return;

    setBusy(true);

    const noteText = lineItems.map((li) => {
      const p = products.find((p) => p.id === li.productId);
      const v = li.variantId ? p?.variants.find((v) => v.id === li.variantId) : null;
      return `${p?.name ?? li.productId}${v ? ` (${v.name})` : ""} x${li.qty}`;
    }).join(", ");

    const storedAmount = payMethod === "tarjeta" ? netAmount : grossAmount;

    const { data: finData, error: finError } = await supabase
      .from("finance_entries")
      .insert({
        user_id: session.user.id,
        entry_type: "venta",
        category: "venta_producto",
        amount: storedAmount,
        entry_date: saleDate,
        payment_method: payMethod,
        notes: payMethod === "tarjeta"
          ? `${noteText} [comisión −$${commissionAmt.toLocaleString("es-MX")}]`
          : noteText,
      })
      .select("id")
      .single();

    if (finError) { setBusy(false); showFeedback(finError.message); return; }

    const financeEntryId = (finData as { id: string } | null)?.id;

    const saleRows = lineItems.map((li) => ({
      user_id: session.user.id!,
      product_id: li.productId,
      variant_id: li.variantId,
      quantity: li.qty,
      unit_price: 0,
      sale_date: saleDate,
      ...(financeEntryId ? { finance_entry_id: financeEntryId } : {}),
    }));

    const { error: saleError } = await supabase.from("sale_items").insert(saleRows);
    setBusy(false);
    if (saleError) { showFeedback(saleError.message); return; }

    const totalUnits = lineItems.reduce((a, li) => a + li.qty, 0);
    showFeedback(`Ticket $${storedAmount.toLocaleString("es-MX")} registrado (${totalUnits} unidades)`);
    setLineItems([]); setTicketTotal("");
    await load(session.user.id);
  }

  async function deleteTicket(ventaId: string) {
    if (!supabase || !session?.user.id) return;
    await supabase.from("sale_items").delete().eq("finance_entry_id", ventaId).eq("user_id", session.user.id);
    await supabase.from("finance_entries").delete().eq("id", ventaId).eq("user_id", session.user.id);
    setVentas((prev) => prev.filter((v) => v.id !== ventaId));
    showFeedback("Ticket eliminado");
  }

  function startEdit(v: VentaEntry) {
    setEditingId(v.id);
    setEditAmount(String(v.amount));
    setEditDate(v.entry_date);
    setEditPayMethod((v.payment_method as typeof PAY_METHODS[number]) ?? "efectivo");
  }

  async function updateTicket() {
    if (!supabase || !session?.user.id || !editingId || !editAmount) return;
    setBusy(true);
    const gross = Number(editAmount);
    const commission = editPayMethod === "tarjeta" ? +(gross * CARD_COMMISSION).toFixed(2) : 0;
    const net = +(gross - commission).toFixed(2);
    const storedAmount = editPayMethod === "tarjeta" ? net : gross;

    const { error } = await supabase
      .from("finance_entries")
      .update({ amount: storedAmount, entry_date: editDate, payment_method: editPayMethod })
      .eq("id", editingId)
      .eq("user_id", session.user.id);

    setBusy(false);
    if (error) { showFeedback(error.message); return; }

    setVentas((prev) => prev.map((v) =>
      v.id === editingId ? { ...v, amount: storedAmount, entry_date: editDate, payment_method: editPayMethod } : v
    ));
    setEditingId(null);
    showFeedback("Ticket actualizado");
  }

  // ── Analytics ──
  const salesByProduct = sales.reduce<Record<string, ProductReport>>((acc, s) => {
    const product = products.find((p) => p.id === s.product_id);
    if (!acc[s.product_id]) {
      acc[s.product_id] = { product_id: s.product_id, name: product?.name ?? "Eliminado", category: product?.category ?? "otro", qty: 0 };
    }
    acc[s.product_id].qty += s.quantity;
    return acc;
  }, {});

  const reports = Object.values(salesByProduct).sort((a, b) => b.qty - a.qty);
  const maxQty = reports[0]?.qty ?? 1;
  const totalQty = reports.reduce((a, c) => a + c.qty, 0);
  const daysWithSales = new Set(sales.map((s) => s.sale_date)).size;
  const lineItemCount = lineItems.reduce((a, li) => a + li.qty, 0);

  const ventasByDate = ventas.reduce<Record<string, VentaEntry[]>>((acc, v) => {
    if (!acc[v.entry_date]) acc[v.entry_date] = [];
    acc[v.entry_date].push(v);
    return acc;
  }, {});
  const ventasDates = Object.keys(ventasByDate).sort((a, b) => b.localeCompare(a));

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-accent" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis Productos</h1>
        <p className="mt-1 text-sm text-muted">Gestiona tu catálogo y registra qué vendiste en cada ticket.</p>
      </div>

      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm">
        <p className="font-semibold text-accent">¿Para qué sirve este módulo?</p>
        <p className="mt-2 text-slate-300">
          Crea tus productos (Burger Clásica, Papas, Bebidas...) y al cerrar cada venta selecciona
          qué productos vendiste. Así sabrás cuáles son tus <strong>productos estrella</strong> sin
          necesitar los precios exactos todavía.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-panelSoft p-1">
        {(["catalogo", "venta", "analisis"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              tab === t ? "bg-panel text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            {t === "catalogo" ? "Catálogo" : t === "venta" ? "Registrar Ticket" : "Análisis"}
            {t === "venta" && lineItemCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                {lineItemCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {feedback}
        </div>
      )}

      {/* ══ CATÁLOGO ══ */}
      {tab === "catalogo" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowProductForm(!showProductForm)}
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-semibold text-white"
            >
              <Plus size={18} /> Nuevo Producto
            </button>
          </div>

          {showProductForm && (
            <div className="rounded-xl border border-slate-800 bg-panel p-5">
              <h3 className="mb-4 font-semibold">Crear producto</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-muted">Nombre *</label>
                  <input
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="Ej: Burger Clásica, Papas Fritas, Refresco..."
                    className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted">Categoría</label>
                  <select
                    value={pCat}
                    onChange={(e) => setPCat(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none"
                  >
                    {PRODUCT_CATS.map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => void createProduct()}
                    disabled={busy || !pName}
                    className="flex-1 rounded-lg bg-accent py-2.5 font-semibold text-white disabled:opacity-50"
                  >
                    {busy ? <Loader2 className="mx-auto animate-spin" size={18} /> : "Guardar"}
                  </button>
                  <button
                    onClick={() => setShowProductForm(false)}
                    className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {products.length === 0 && !showProductForm && (
            <div className="rounded-xl border border-slate-800 bg-panel p-8 text-center">
              <Package size={32} className="mx-auto mb-3 text-slate-600" />
              <p className="font-medium">No tienes productos aún</p>
              <p className="mt-1 text-sm text-muted">
                Agrega tus productos para empezar a registrar qué se vende en cada ticket.
              </p>
              <button
                onClick={() => setShowProductForm(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent"
              >
                <Plus size={14} /> Crear primer producto
              </button>
            </div>
          )}

          <div className="space-y-3">
            {products.map((product) => {
              const report = salesByProduct[product.id];
              const isExpanded = expandedId === product.id;
              return (
                <div key={product.id} className="overflow-hidden rounded-xl border border-slate-800 bg-panel">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <ShoppingBag size={16} />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted">
                          <span className="capitalize">{product.category}</span>
                          {product.variants.length > 0 && (
                            <><span>·</span><span>{product.variants.length} variante{product.variants.length !== 1 ? "s" : ""}</span></>
                          )}
                          {report && (
                            <><span>·</span><span className="text-emerald-400">{report.qty} vendidos</span></>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : product.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-panelSoft hover:text-white"
                      >
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                      <button
                        onClick={() => void deleteProduct(product.id)}
                        className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-3 border-t border-slate-800 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted">Variantes</p>
                      {product.variants.length === 0 && (
                        <p className="text-xs text-slate-500">
                          Sin variantes. Agrega opciones como &quot;Doble carne&quot;, &quot;Sin cebolla&quot;, etc.
                        </p>
                      )}
                      {product.variants.map((v) => (
                        <div key={v.id} className="flex items-center justify-between rounded-lg bg-panelSoft px-3 py-2 text-sm">
                          <span className="font-medium">{v.name}</span>
                          <button
                            onClick={() => void deleteVariant(v.id, product.id)}
                            className="text-slate-600 transition-colors hover:text-red-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          value={vName}
                          onChange={(e) => setVName(e.target.value)}
                          placeholder="Nombre variante (ej: Doble carne)"
                          className="flex-1 rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-xs outline-none focus:border-accent"
                        />
                        <button
                          onClick={() => void addVariant(product.id)}
                          disabled={!vName}
                          className="rounded-lg bg-accent/10 px-3 py-2 text-xs font-medium text-accent disabled:opacity-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ REGISTRAR TICKET ══ */}
      {tab === "venta" && (
        <div className="space-y-5">
          {products.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-panel p-8 text-center">
              <p className="font-medium">Primero crea tus productos</p>
              <p className="mt-1 text-sm text-muted">Ve al Catálogo y agrega tus productos.</p>
              <button onClick={() => setTab("catalogo")} className="mt-4 inline-flex items-center gap-1 text-sm text-accent">
                Ir al catálogo →
              </button>
            </div>
          ) : (
            <>
              {/* Step 1 — Product grid */}
              <div>
                <p className="mb-3 text-sm font-medium text-slate-300">
                  1. Agrega productos al ticket <span className="text-xs text-muted">(toca para añadir)</span>
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {products.map((product) => {
                    const inCart = lineItems.some((li) => li.productId === product.id);
                    return (
                      <button
                        key={product.id}
                        onClick={() => addToLineItems(product.id)}
                        className={`relative overflow-hidden rounded-xl border p-3 text-left transition-all active:scale-95 ${
                          inCart ? "border-accent/50 bg-accent/10" : "border-slate-800 bg-panel hover:border-slate-700"
                        }`}
                      >
                        {inCart && (
                          <CheckCircle2 size={14} className="absolute right-2 top-2 text-accent" />
                        )}
                        <p className={`text-sm font-medium leading-tight ${inCart ? "text-white" : "text-slate-300"}`}>
                          {product.name}
                        </p>
                        <p className="mt-0.5 text-xs capitalize text-muted">{product.category}</p>
                        {product.variants.length > 0 && (
                          <p className="mt-1 text-xs text-slate-500">{product.variants.length} variante{product.variants.length !== 1 ? "s" : ""}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cart — line items */}
              {lineItems.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-slate-700 bg-panel">
                  <p className="border-b border-slate-800 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted">
                    Productos en este ticket
                  </p>
                  <div className="divide-y divide-slate-800">
                    {lineItems.map((li) => {
                      const product = products.find((p) => p.id === li.productId);
                      return (
                        <div key={li.lid} className="px-4 py-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{product?.name}</p>
                              {product && product.variants.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {product.variants.map((v) => (
                                    <button
                                      key={v.id}
                                      onClick={() => setLineItemVariant(li.lid, v.id)}
                                      className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                                        li.variantId === v.id
                                          ? "bg-accent text-white"
                                          : "bg-panelSoft text-slate-400 hover:text-white"
                                      }`}
                                    >
                                      {v.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 rounded-lg bg-panelSoft px-1.5 py-1">
                                <button onClick={() => changeLineItemQty(li.lid, -1)} className="text-slate-400 hover:text-white">
                                  <Minus size={12} />
                                </button>
                                <span className="w-5 text-center text-sm font-bold text-accent">{li.qty}</span>
                                <button onClick={() => changeLineItemQty(li.lid, 1)} className="text-slate-400 hover:text-white">
                                  <Plus size={12} />
                                </button>
                              </div>
                              <button onClick={() => removeLineItem(li.lid)} className="text-slate-600 hover:text-red-400">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2 — Ticket data */}
              <div className="rounded-xl border border-slate-800 bg-panel p-5">
                <p className="mb-4 text-sm font-medium text-slate-300">2. Datos del ticket</p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs text-muted">Total del ticket *</label>
                    <input
                      value={ticketTotal}
                      onChange={(e) => setTicketTotal(e.target.value)}
                      type="number"
                      inputMode="decimal"
                      placeholder="$0.00 — lo que cobró el ticket"
                      className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                    {payMethod === "tarjeta" && grossAmount > 0 && (
                      <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs">
                        <div className="flex justify-between text-amber-300">
                          <span>Comisión terminal (4.06%)</span>
                          <span>−${commissionAmt.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="mt-0.5 flex justify-between font-semibold text-emerald-300">
                          <span>Neto a recibir</span>
                          <span>${netAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <p className="mt-1 text-slate-400">Se guarda el neto en tus finanzas.</p>
                      </div>
                    )}
                  </div>

                  {/* Payment method */}
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
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      type="date"
                      className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none"
                    />
                  </div>

                  <button
                    onClick={() => void registerTicket()}
                    disabled={busy || lineItems.length === 0 || !ticketTotal}
                    className="w-full rounded-lg bg-accent py-2.5 font-semibold text-white disabled:opacity-50"
                  >
                    {busy
                      ? <Loader2 className="mx-auto animate-spin" size={18} />
                      : lineItems.length === 0
                        ? "Agrega al menos un producto"
                        : !ticketTotal
                          ? "Ingresa el total del ticket"
                          : `Registrar ticket — $${(payMethod === "tarjeta" ? netAmount : grossAmount).toLocaleString("es-MX")}`}
                  </button>

                  <p className="text-center text-xs text-muted">
                    El total se guarda en finanzas. Los productos sirven para ver cuáles se venden más.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Tickets registrados */}
          {ventas.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Receipt size={16} className="text-muted" />
                <h3 className="font-semibold">
                  Tickets registrados <span className="text-sm font-normal text-muted">(este mes)</span>
                </h3>
              </div>
              <div className="space-y-4">
                {ventasDates.map((date) => {
                  const dayEntries = ventasByDate[date];
                  const dayTotal = dayEntries.reduce((a, v) => a + Number(v.amount), 0);
                  return (
                    <div key={date}>
                      <div className="mb-2 flex items-center justify-between px-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                          {new Date(date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" })}
                        </p>
                        <p className="text-xs text-muted">
                          {dayEntries.length} ticket{dayEntries.length !== 1 ? "s" : ""} · <span className="font-medium text-emerald-400">${dayTotal.toLocaleString("es-MX")}</span>
                        </p>
                      </div>
                      <div className="space-y-2">
                {dayEntries.map((v) => {
                  const isEditing = editingId === v.id;
                  const editGross = Number(editAmount) || 0;
                  const editCommission = editPayMethod === "tarjeta" ? +(editGross * CARD_COMMISSION).toFixed(2) : 0;
                  const editNet = +(editGross - editCommission).toFixed(2);

                  if (isEditing) {
                    return (
                      <div key={v.id} className="rounded-lg border border-accent/30 bg-panel p-4 text-sm space-y-3">
                        <p className="text-xs font-medium text-muted uppercase tracking-wider">Editar ticket</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs text-muted">Total cobrado *</label>
                            <input
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              type="number"
                              inputMode="decimal"
                              className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none focus:border-accent"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-muted">Fecha</label>
                            <input
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              type="date"
                              className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block text-xs text-muted">Método de pago</label>
                          <div className="grid grid-cols-3 gap-2">
                            {PAY_METHODS.map((m) => (
                              <button
                                key={m}
                                onClick={() => setEditPayMethod(m)}
                                className={`rounded-lg py-2 text-xs font-medium capitalize transition-colors ${
                                  editPayMethod === m
                                    ? "bg-accent/20 text-accent ring-1 ring-accent/40"
                                    : "bg-panelSoft text-slate-400 hover:text-white"
                                }`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                        {editPayMethod === "tarjeta" && editGross > 0 && (
                          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs">
                            <div className="flex justify-between text-amber-300">
                              <span>Comisión terminal (4.06%)</span>
                              <span>−${editCommission.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="mt-0.5 flex justify-between font-semibold text-emerald-300">
                              <span>Neto a guardar</span>
                              <span>${editNet.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => void updateTicket()}
                            disabled={busy || !editAmount}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent py-2 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            {busy ? <Loader2 className="animate-spin" size={14} /> : <><Check size={14} /> Guardar</>}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded-lg border border-slate-700 px-3 py-2 text-slate-400 hover:text-white"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={v.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-panel px-4 py-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-emerald-400">${Number(v.amount).toLocaleString("es-MX")}</span>
                          {v.payment_method && (
                            <span className="rounded-full bg-panelSoft px-2 py-0.5 text-xs capitalize text-muted">{v.payment_method}</span>
                          )}
                          <span className="text-xs text-muted">
                            {new Date(v.entry_date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        {v.notes && (
                          <p className="mt-0.5 truncate text-xs text-slate-400">{v.notes}</p>
                        )}
                      </div>
                      <div className="ml-3 flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => startEdit(v)}
                          className="text-slate-600 transition-colors hover:text-accent"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => void deleteTicket(v.id)}
                          className="text-slate-600 transition-colors hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ ANÁLISIS ══ */}
      {tab === "analisis" && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-panel p-8 text-center">
              <BarChart3 size={32} className="mx-auto mb-3 text-slate-600" />
              <p className="font-medium">Sin datos de ventas aún</p>
              <p className="mt-1 text-sm text-muted">Registra tickets para ver cuáles productos se venden más.</p>
              <button onClick={() => setTab("venta")} className="mt-4 inline-flex items-center gap-1 text-sm text-accent">
                Registrar primer ticket →
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-800 bg-panel p-4">
                  <p className="text-xs text-muted">Unidades vendidas</p>
                  <p className="mt-1 text-2xl font-bold">{totalQty.toLocaleString("es-MX")}</p>
                  <p className="text-xs text-muted">este mes</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-panel p-4">
                  <p className="text-xs text-muted">Productos distintos</p>
                  <p className="mt-1 text-2xl font-bold">{reports.length}</p>
                  <p className="text-xs text-muted">con ventas</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-panel p-4">
                  <p className="text-xs text-muted">Días registrados</p>
                  <p className="mt-1 text-2xl font-bold">{daysWithSales}</p>
                  <p className="text-xs text-muted">días con ventas</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-panel p-4">
                <p className="mb-1 text-sm font-medium">Costo por unidad vendida</p>
                <p className="mb-3 text-xs text-muted">
                  Ingresa tus gastos fijos del mes para saber cuánto te cuesta cada unidad vendida.
                </p>
                <input
                  value={fixedCosts}
                  onChange={(e) => setFixedCosts(e.target.value)}
                  type="number"
                  inputMode="decimal"
                  placeholder="Gastos fijos del mes ($)"
                  className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none focus:border-accent"
                />
                {fixedCosts && Number(fixedCosts) > 0 && totalQty > 0 && (
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-panelSoft px-4 py-3 text-sm">
                    <span className="text-muted">
                      ${Number(fixedCosts).toLocaleString("es-MX")} ÷ {totalQty} unidades
                    </span>
                    <span className="font-bold text-accent">
                      ${(Number(fixedCosts) / totalQty).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / unidad
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Star size={16} className="text-accent" />
                  <h3 className="font-semibold">Productos más vendidos (este mes)</h3>
                </div>
                <div className="space-y-3">
                  {reports.map((r, i) => (
                    <div key={r.product_id} className="rounded-xl border border-slate-800 bg-panel p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${i === 0 ? "text-accent" : "text-slate-500"}`}>#{i + 1}</span>
                          <span className="font-medium">{r.name}</span>
                          <span className="rounded-full bg-panelSoft px-2 py-0.5 text-xs capitalize text-muted">{r.category}</span>
                        </div>
                        <span className="font-semibold">
                          {r.qty} <span className="text-xs font-normal text-muted">unidades</span>
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${i === 0 ? "bg-accent" : "bg-slate-600"}`}
                          style={{ width: `${Math.round((r.qty / maxQty) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

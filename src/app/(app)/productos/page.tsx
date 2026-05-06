"use client";

import { useEffect, useState } from "react";
import {
  Plus, ShoppingBag, Loader2, Trash2, ChevronDown,
  Star, BarChart3, Package, Minus, CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import type { Product, ProductVariant, SaleItem } from "@/lib/types";

type ProductWithVariants = Product & { variants: ProductVariant[] };
type ProductReport = { product_id: string; name: string; category: string; qty: number };

const PRODUCT_CATS = ["burger", "acompañamiento", "bebida", "postre", "combo", "otro"];
const PAY_METHODS = ["efectivo", "tarjeta", "transferencia"] as const;

export default function ProductosPage() {
  const { session } = useAuth();
  const [tab, setTab] = useState<"catalogo" | "venta" | "analisis">("catalogo");
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [sales, setSales] = useState<SaleItem[]>([]);
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
  const [selected, setSelected] = useState<Record<string, number>>({});          // productId → qty
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({}); // productId → variantId
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
      .select("id, user_id, product_id, variant_id, quantity, unit_price, sale_date, created_at")
      .eq("user_id", userId)
      .gte("sale_date", monthStart.toISOString().slice(0, 10))
      .order("sale_date", { ascending: false });

    setProducts(
      (prods ?? []).map((p) => ({
        ...(p as unknown as Product),
        variants: ((p as Record<string, unknown>).product_variants as ProductVariant[]) ?? [],
      }))
    );
    setSales((salesData ?? []) as SaleItem[]);
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

  // ── Ticket selection ──
  function toggleProduct(productId: string) {
    setSelected((prev) => {
      if (prev[productId]) {
        const next = { ...prev };
        delete next[productId];
        // clear variant too
        setSelectedVariants((sv) => { const s = { ...sv }; delete s[productId]; return s; });
        return next;
      }
      return { ...prev, [productId]: 1 };
    });
  }

  function changeQty(productId: string, delta: number) {
    setSelected((prev) => {
      const next = (prev[productId] ?? 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        setSelectedVariants((sv) => { const s = { ...sv }; delete s[productId]; return s; });
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  }

  function pickVariant(productId: string, variantId: string) {
    setSelectedVariants((prev) =>
      prev[productId] === variantId
        ? (() => { const s = { ...prev }; delete s[productId]; return s; })()
        : { ...prev, [productId]: variantId }
    );
  }

  async function registerTicket() {
    if (!supabase || !session?.user.id) return;
    const entries = Object.entries(selected);
    if (entries.length === 0 || !ticketTotal) return;

    setBusy(true);

    const { error: finError } = await supabase.from("finance_entries").insert({
      user_id: session.user.id,
      entry_type: "venta",
      category: "venta_producto",
      amount: Number(ticketTotal),
      entry_date: saleDate,
      payment_method: payMethod,
      notes: entries.map(([id, qty]) => {
        const p = products.find((p) => p.id === id);
        const v = selectedVariants[id]
          ? p?.variants.find((v) => v.id === selectedVariants[id])
          : null;
        return `${p?.name ?? id}${v ? ` (${v.name})` : ""} x${qty}`;
      }).join(", "),
    });

    if (finError) { setBusy(false); showFeedback(finError.message); return; }

    const saleRows = entries.map(([productId, qty]) => ({
      user_id: session.user.id!,
      product_id: productId,
      variant_id: selectedVariants[productId] ?? null,
      quantity: qty,
      unit_price: 0,
      sale_date: saleDate,
    }));

    const { error: saleError } = await supabase.from("sale_items").insert(saleRows);
    setBusy(false);
    if (saleError) { showFeedback(saleError.message); return; }

    const totalUnits = entries.reduce((a, [, qty]) => a + qty, 0);
    showFeedback(`Ticket $${Number(ticketTotal).toLocaleString("es-MX")} registrado (${totalUnits} productos)`);
    setSelected({}); setSelectedVariants({}); setTicketTotal("");
    await load(session.user.id);
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
  const selectedCount = Object.keys(selected).length;

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
            {t === "venta" && selectedCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                {selectedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {feedback && (
        <div className="rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-emerald-300">
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
                <p className="mb-3 text-sm font-medium text-slate-300">1. Selecciona los productos del ticket</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {products.map((product) => {
                    const qty = selected[product.id] ?? 0;
                    const isSelected = qty > 0;
                    const pickedVariant = selectedVariants[product.id];

                    return (
                      <div
                        key={product.id}
                        className={`relative overflow-hidden rounded-xl border transition-all ${
                          isSelected ? "border-accent/50 bg-accent/10" : "border-slate-800 bg-panel hover:border-slate-700"
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle2 size={14} className="absolute right-2 top-2 text-accent" />
                        )}

                        {/* Tap to toggle select */}
                        <button
                          onClick={() => toggleProduct(product.id)}
                          className="w-full p-3 text-left"
                        >
                          <p className={`text-sm font-medium leading-tight ${isSelected ? "text-white" : "text-slate-300"}`}>
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-xs capitalize text-muted">{product.category}</p>
                        </button>

                        {/* Variant chips */}
                        {isSelected && product.variants.length > 0 && (
                          <div className="flex flex-wrap gap-1 px-3 pb-2">
                            {product.variants.map((v) => (
                              <button
                                key={v.id}
                                onClick={() => pickVariant(product.id, v.id)}
                                className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                                  pickedVariant === v.id
                                    ? "bg-accent text-white"
                                    : "bg-panelSoft text-slate-400 hover:text-white"
                                }`}
                              >
                                {v.name}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Qty stepper */}
                        {isSelected && (
                          <div className="mx-3 mb-3 flex items-center justify-between rounded-lg bg-panel px-2 py-1.5">
                            <button onClick={() => changeQty(product.id, -1)} className="text-slate-400 hover:text-white">
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold text-accent">{qty}</span>
                            <button onClick={() => changeQty(product.id, 1)} className="text-slate-400 hover:text-white">
                              <Plus size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2 — Ticket data */}
              <div className="rounded-xl border border-slate-800 bg-panel p-5">
                <p className="mb-4 text-sm font-medium text-slate-300">2. Datos del ticket</p>
                <div className="space-y-4">
                  {/* Selected summary */}
                  {selectedCount > 0 && (
                    <div className="rounded-lg bg-panelSoft px-3 py-2 text-xs text-muted">
                      {Object.entries(selected).map(([id, qty]) => {
                        const p = products.find((p) => p.id === id);
                        const v = selectedVariants[id]
                          ? p?.variants.find((v) => v.id === selectedVariants[id])
                          : null;
                        return (
                          <span key={id} className="mr-2 text-slate-300">
                            {p?.name}{v ? ` (${v.name})` : ""} ×{qty}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-xs text-muted">Total del ticket *</label>
                    <input
                      value={ticketTotal}
                      onChange={(e) => setTicketTotal(e.target.value)}
                      type="number"
                      placeholder="$0.00 — lo que cobró el ticket"
                      className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none focus:border-accent"
                    />
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
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      type="date"
                      className="w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none"
                    />
                  </div>

                  <button
                    onClick={() => void registerTicket()}
                    disabled={busy || selectedCount === 0 || !ticketTotal}
                    className="w-full rounded-lg bg-accent py-2.5 font-semibold text-white disabled:opacity-50"
                  >
                    {busy
                      ? <Loader2 className="mx-auto animate-spin" size={18} />
                      : selectedCount === 0
                        ? "Selecciona al menos un producto"
                        : !ticketTotal
                          ? "Ingresa el total del ticket"
                          : `Registrar ticket — $${Number(ticketTotal).toLocaleString("es-MX")}`}
                  </button>

                  <p className="text-center text-xs text-muted">
                    El total se guarda en finanzas. Los productos sirven para ver cuáles se venden más.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Recent sales */}
          {sales.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold">Ventas recientes (este mes)</h3>
              <div className="space-y-2">
                {sales.slice(0, 10).map((s) => {
                  const product = products.find((p) => p.id === s.product_id);
                  const variant = product?.variants.find((v) => v.id === s.variant_id);
                  return (
                    <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-panel px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium">
                          {product?.name ?? "Producto"}{variant ? ` — ${variant.name}` : ""}
                        </p>
                        <p className="text-xs text-muted">
                          {s.quantity} unidad{s.quantity !== 1 ? "es" : ""} ·{" "}
                          {new Date(s.sale_date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                        </p>
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

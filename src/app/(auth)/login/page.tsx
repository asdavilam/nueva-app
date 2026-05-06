"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChefHat } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!loading && session) router.replace("/dashboard");
  }, [session, loading, router]);

  async function submit() {
    if (!supabase || !email || !password) return;
    setBusy(true);
    setFeedback("");
    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) { setFeedback(error.message); return; }
    if (mode === "signup") setFeedback("Cuenta creada. Ya puedes entrar.");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-accent" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <ChefHat size={32} />
          </div>
          <h1 className="text-2xl font-bold">Burger Business Blueprint</h1>
          <p className="mt-2 text-sm text-muted">
            Tu guía paso a paso para profesionalizar tu negocio.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-panel p-6">
          <div className="mb-4 rounded-lg bg-accent/10 p-3 text-sm text-amber-200">
            <p className="font-medium">¿Primera vez aquí?</p>
            <p className="mt-1 text-xs text-slate-300">
              Crea tu cuenta gratis. No necesitas saber nada de finanzas — la app te enseña todo.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setMode("login")}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${mode === "login" ? "bg-accent text-white" : "bg-panelSoft text-slate-300"}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${mode === "signup" ? "bg-accent text-white" : "bg-panelSoft text-slate-300"}`}
            >
              Crear cuenta
            </button>
          </div>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void submit()}
            placeholder="tu-correo@email.com"
            type="email"
            className="mb-2 w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void submit()}
            placeholder="Contraseña"
            type="password"
            className="mb-4 w-full rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm outline-none focus:border-accent"
          />

          <button
            onClick={() => void submit()}
            disabled={busy || !email || !password}
            className="w-full rounded-lg bg-accent px-3 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {busy ? <Loader2 className="mx-auto animate-spin" size={18} /> : mode === "login" ? "Iniciar sesión" : "Crear cuenta gratis"}
          </button>

          {feedback && (
            <p className={`mt-3 text-sm ${feedback.includes("rror") || feedback.includes("nválid") ? "text-red-400" : "text-emerald-400"}`}>
              {feedback}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

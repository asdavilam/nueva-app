"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { templates } from "@/lib/data";

export default function PlantillasPage() {
  const { session } = useAuth();
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!session?.user.id) return;
    void load(session.user.id);
  }, [session?.user.id]);

  async function load(userId: string) {
    if (!supabase) return;
    const { data } = await supabase
      .from("notes")
      .select("title, content")
      .eq("user_id", userId)
      .ilike("title", "template:%");
    const mapped = Object.fromEntries((data ?? []).map((n) => [n.title.replace("template:", ""), n.content]));
    setContent(mapped);
    setLoading(false);
  }

  async function save(templateId: string) {
    if (!supabase || !session?.user.id) return;
    setSaving(templateId);
    const title = `template:${templateId}`;
    const val = content[templateId] ?? templates.find((t) => t.id === templateId)?.sample ?? "";
    const { data: existing } = await supabase
      .from("notes")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("title", title)
      .maybeSingle();
    if (existing?.id) {
      await supabase.from("notes").update({ content: val }).eq("id", existing.id);
    } else {
      await supabase.from("notes").insert({ user_id: session.user.id, title, content: val });
    }
    setSaving(null);
    setFeedback("Plantilla guardada.");
    setTimeout(() => setFeedback(""), 2500);
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-accent" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plantillas administrativas</h1>
        <p className="mt-1 text-sm text-muted">Formatos listos para usar. Personalízalos para tu negocio y guárdalos.</p>
      </div>

      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm">
        <p className="font-semibold text-accent">¿Cómo usar estas plantillas?</p>
        <p className="mt-1 text-slate-300">
          Cada plantilla es un formato que puedes copiar a papel, Excel o tu app de notas.
          Personaliza los campos que necesitas, guarda tus cambios y úsalas todos los días. La consistencia crea hábitos y los hábitos construyen negocios sólidos.
        </p>
      </div>

      {feedback && (
        <div className="rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-emerald-300">
          {feedback}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {templates.map((t) => {
          const val = content[t.id] ?? t.sample;
          return (
            <div key={t.id} className="rounded-xl border border-slate-800 bg-panel p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-muted">{t.purpose}</p>
                </div>
              </div>

              <textarea
                value={val}
                onChange={(e) => setContent((prev) => ({ ...prev, [t.id]: e.target.value }))}
                rows={8}
                className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-300 outline-none focus:border-accent"
              />

              <button
                onClick={() => void save(t.id)}
                disabled={saving === t.id}
                className="mt-3 flex items-center gap-2 rounded-lg bg-panelSoft px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50"
              >
                {saving === t.id ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />}
                Guardar cambios
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

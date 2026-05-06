"use client";

import { useEffect, useState } from "react";
import { Loader2, Trophy, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { ensureCatalogAndProgress } from "@/lib/app-data";

type Achievement = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
};

export default function LogrosPage() {
  const { session } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user.id) return;
    void load(session.user.id);
  }, [session?.user.id]);

  async function load(userId: string) {
    if (!supabase) return;
    const [tasks] = await Promise.all([ensureCatalogAndProgress(userId)]);

    const { data: finRows } = await supabase
      .from("finance_entries")
      .select("id")
      .eq("user_id", userId);

    const { data: kpiRows } = await supabase
      .from("kpis")
      .select("id")
      .eq("user_id", userId);

    const completedCount = tasks.filter((t) => t.completed).length;
    const week1Done = tasks.filter((t) => t.week === 1).every((t) => t.completed);
    const week2Done = tasks.filter((t) => t.week === 2).every((t) => t.completed);
    const week3Done = tasks.filter((t) => t.week === 3).every((t) => t.completed);
    const allDone = tasks.length > 0 && tasks.every((t) => t.completed);
    const hasKpi = (kpiRows?.length ?? 0) > 0;
    const hasFinance = (finRows?.length ?? 0) >= 10;

    setAchievements([
      {
        id: "first-task",
        title: "Primer paso dado",
        description: "Completaste tu primera tarea del sistema base.",
        emoji: "🌱",
        unlocked: completedCount >= 1
      },
      {
        id: "week1",
        title: "Control financiero",
        description: "Completaste la Semana 1: Control Financiero Básico.",
        emoji: "💰",
        unlocked: week1Done
      },
      {
        id: "week2",
        title: "Mente rentable",
        description: "Completaste la Semana 2: Análisis de Rentabilidad.",
        emoji: "🧠",
        unlocked: week2Done
      },
      {
        id: "week3",
        title: "Operación en orden",
        description: "Completaste la Semana 3: Operación y Orden Interno.",
        emoji: "⚙️",
        unlocked: week3Done
      },
      {
        id: "all-done",
        title: "Negocio organizado",
        description: "Completaste el Sistema Base de 21 días. Ya tienes las bases.",
        emoji: "🏆",
        unlocked: allDone
      },
      {
        id: "first-kpi",
        title: "Primer mes medido",
        description: "Guardaste tus primeros KPIs mensuales.",
        emoji: "📊",
        unlocked: hasKpi
      },
      {
        id: "finance-habit",
        title: "Hábito financiero",
        description: "Registraste 10 o más movimientos de ventas y gastos.",
        emoji: "📈",
        unlocked: hasFinance
      },
      {
        id: "ready-to-grow",
        title: "Base lista para crecer",
        description: "Completaste el sistema base y ya tienes KPIs y movimientos registrados.",
        emoji: "🚀",
        unlocked: allDone && hasKpi && hasFinance
      }
    ]);

    setLoading(false);
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-accent" />
    </div>
  );

  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tus logros</h1>
        <p className="mt-1 text-sm text-muted">Cada paso que das en tu negocio merece ser reconocido.</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-panel p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Trophy size={28} />
          </div>
          <div>
            <p className="text-3xl font-bold">{unlocked} / {achievements.length}</p>
            <p className="text-sm text-muted">logros desbloqueados</p>
          </div>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-2.5 rounded-full bg-accent transition-all duration-700"
            style={{ width: `${achievements.length ? Math.round((unlocked / achievements.length) * 100) : 0}%` }}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
              a.unlocked
                ? "border-accent/30 bg-accent/5"
                : "border-slate-800 bg-panel opacity-50 grayscale"
            }`}
          >
            <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
              a.unlocked ? "bg-accent/10" : "bg-panelSoft"
            }`}>
              {a.unlocked ? a.emoji : <Lock size={18} className="text-slate-600" />}
            </div>
            <div>
              <p className={`font-semibold ${a.unlocked ? "text-white" : "text-slate-500"}`}>{a.title}</p>
              <p className={`text-xs ${a.unlocked ? "text-slate-300" : "text-slate-600"}`}>{a.description}</p>
            </div>
          </div>
        ))}
      </div>

      {unlocked === 0 && (
        <div className="rounded-xl border border-slate-800 bg-panel p-6 text-center">
          <p className="text-2xl mb-2">🌱</p>
          <p className="font-medium">Empieza el Sistema Base 21 días</p>
          <p className="mt-1 text-sm text-muted">Completa tu primera tarea para desbloquear tu primer logro.</p>
        </div>
      )}
    </div>
  );
}

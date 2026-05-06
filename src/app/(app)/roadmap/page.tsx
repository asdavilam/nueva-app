"use client";

import { useEffect, useState } from "react";
import { Lock, Unlock, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { phases } from "@/lib/data";
import { ensureCatalogAndProgress } from "@/lib/app-data";

type UnlockStatus = "desbloqueado" | "en_progreso" | "bloqueado";

type PhaseStatus = {
  id: number;
  status: UnlockStatus;
  hint: string;
};

export default function RoadmapPage() {
  const { session } = useAuth();
  const [expanded, setExpanded] = useState<number | null>(1);
  const [phaseStatuses, setPhaseStatuses] = useState<PhaseStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user.id) return;
    void computeStatuses(session.user.id);
  }, [session?.user.id]);

  async function computeStatuses(userId: string) {
    if (!supabase) return;
    setLoading(true);

    const [tasks] = await Promise.all([ensureCatalogAndProgress(userId)]);

    const week1Done = tasks.filter((t) => t.week === 1).every((t) => t.completed);
    const week2Done = tasks.filter((t) => t.week === 2).every((t) => t.completed);
    const allDone = tasks.length > 0 && tasks.every((t) => t.completed);
    const completedPct = tasks.length > 0
      ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)
      : 0;

    const { data: kpiRows } = await supabase
      .from("kpis")
      .select("id")
      .eq("user_id", userId);
    const kpiCount = kpiRows?.length ?? 0;

    const statuses: PhaseStatus[] = [
      {
        id: 1,
        status: "desbloqueado",
        hint: `Progreso actual: ${completedPct}% del Sistema Base 21 días`,
      },
      {
        id: 2,
        status: week1Done ? "desbloqueado" : "bloqueado",
        hint: week1Done
          ? "Semana 1 completada — Control financiero dominado"
          : "Completa la Semana 1 del Sistema 21 días (Control Financiero Básico)",
      },
      {
        id: 3,
        status: allDone ? "desbloqueado" : week2Done ? "en_progreso" : "bloqueado",
        hint: allDone
          ? "Sistema Base completo — acceso desbloqueado"
          : week2Done
            ? "Completa la Semana 3 para desbloquear esta fase"
            : "Completa las 3 semanas del Sistema 21 días",
      },
      {
        id: 4,
        status: allDone && kpiCount >= 3 ? "desbloqueado" : "bloqueado",
        hint:
          allDone && kpiCount >= 3
            ? "Base lista — evalúa rentabilidad antes de expandir"
            : `Necesitas: Sistema Base completo${allDone ? " ✓" : ""} + 3 meses de KPIs registrados (tienes ${kpiCount})`,
      },
      {
        id: 5,
        status: "bloqueado",
        hint: "Requiere Fase 4 validada con 2+ sucursales rentables",
      },
      {
        id: 6,
        status: "bloqueado",
        hint: "Requiere Fase 5 completada y estructura legal de franquicia",
      },
      {
        id: 7,
        status: "bloqueado",
        hint: "Requiere franquicia activa y resultados comprobados",
      },
    ];

    setPhaseStatuses(statuses);
    setLoading(false);
  }

  const getStatus = (phaseId: number): PhaseStatus =>
    phaseStatuses.find((s) => s.id === phaseId) ?? {
      id: phaseId,
      status: "bloqueado",
      hint: "",
    };

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
        <h1 className="text-2xl font-bold">Roadmap de crecimiento</h1>
        <p className="mt-1 text-sm text-muted">
          El camino real de negocio familiar a cadena franquiciable. Paso a paso.
        </p>
      </div>

      {/* Philosophy */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
        <p className="font-semibold text-amber-300">La ruta real (sin atajos)</p>
        <p className="mt-2 text-sm text-slate-300">
          Muchos dueños quieren franquiciar antes de dominar una sola sucursal. Ese es el error más
          costoso del negocio. La ruta correcta es:
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-amber-200">
          {[
            "Negocio familiar",
            "Negocio profesional",
            "Negocio escalable",
            "Multisucursal",
            "Franquicia",
          ].map((step, i, arr) => (
            <span key={step} className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/20 px-3 py-1">{step}</span>
              {i < arr.length - 1 && <span className="text-amber-600">→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Progress summary */}
      {phaseStatuses.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {(["desbloqueado", "en_progreso", "bloqueado"] as UnlockStatus[]).map((s) => {
            const count = phaseStatuses.filter((p) => p.status === s).length;
            const labels = { desbloqueado: "Desbloqueadas", en_progreso: "En progreso", bloqueado: "Bloqueadas" };
            const colors = { desbloqueado: "text-accent", en_progreso: "text-warning", bloqueado: "text-slate-500" };
            return (
              <div key={s} className="rounded-xl border border-slate-800 bg-panel p-4 text-center">
                <p className={`text-2xl font-bold ${colors[s]}`}>{count}</p>
                <p className="text-xs text-muted">{labels[s]}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* The 10 fundamentals */}
      <div className="rounded-xl border border-slate-800 bg-panel p-5">
        <p className="font-semibold">Las 10 bases antes de pensar en franquiciar</p>
        <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
          {[
            "Rentabilidad real y constante",
            "Marca fuerte y reconocible",
            "Procesos repetibles y documentados",
            "Calidad constante en el producto",
            "Buena administración financiera",
            "Producto amado por los clientes",
            "Números claros mes a mes",
            "Segunda sucursal exitosa",
            "Equipo confiable y capacitado",
            "Liderazgo fuerte del dueño",
          ].map((base, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-panelSoft text-xs text-muted">
                {i + 1}
              </span>
              <span>{base}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-3">
        {phases.map((phase) => {
          const { status, hint } = getStatus(phase.id);
          const isOpen = expanded === phase.id;
          const unlocked = status === "desbloqueado";
          const inProgress = status === "en_progreso";

          return (
            <div
              key={phase.id}
              className={`overflow-hidden rounded-xl border transition-colors ${
                unlocked
                  ? "border-accent/30 bg-accent/5"
                  : inProgress
                    ? "border-warning/30 bg-warning/5"
                    : "border-slate-800 bg-panel"
              }`}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : phase.id)}
                className="flex w-full items-center gap-4 p-5 text-left"
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                    unlocked
                      ? "bg-accent/20 text-accent"
                      : inProgress
                        ? "bg-warning/20 text-warning"
                        : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {phase.id <= 6 ? phase.id : "★"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{phase.name}</p>
                    {unlocked ? (
                      <Unlock size={14} className="text-accent" />
                    ) : inProgress ? (
                      <Unlock size={14} className="text-warning opacity-60" />
                    ) : (
                      <Lock size={14} className="text-slate-500" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{phase.objective}</p>
                  <p className="mt-1 text-xs text-slate-500">Tiempo estimado: {phase.estimate}</p>
                </div>
                {isOpen ? (
                  <ChevronUp size={18} className="shrink-0 text-muted" />
                ) : (
                  <ChevronDown size={18} className="shrink-0 text-muted" />
                )}
              </button>

              {isOpen && (
                <div className="space-y-4 border-t border-slate-800/50 px-5 pb-5 pt-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      Requisitos previos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {phase.prerequisites.map((req) => (
                        <span
                          key={req}
                          className="rounded-full border border-slate-700 bg-panelSoft px-3 py-1 text-xs text-slate-300"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      Tareas clave de esta fase
                    </p>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {phase.tasks.map((task) => (
                        <div key={task} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic status hint */}
                  <div
                    className={`rounded-lg border p-3 text-xs ${
                      unlocked
                        ? "border-accent/20 bg-accent/5 text-accent"
                        : inProgress
                          ? "border-warning/20 bg-warning/5 text-amber-300"
                          : "border-slate-700 bg-panelSoft text-slate-400"
                    }`}
                  >
                    {unlocked ? "✅" : inProgress ? "⏳" : "🔒"} {hint}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { ensureCatalogAndProgress } from "@/lib/app-data";
import { ChecklistTask, TaskStatus } from "@/lib/types";

const WEEK_INFO = {
  1: { label: "Semana 1", title: "Control Financiero Básico", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/5" },
  2: { label: "Semana 2", title: "Análisis de Rentabilidad", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/5" },
  3: { label: "Semana 3", title: "Operación y Orden Interno", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/5" }
} as const;

export default function ChecklistPage() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user.id) return;
    void load(session.user.id);
  }, [session?.user.id]);

  async function load(userId: string) {
    setLoading(true);
    const t = await ensureCatalogAndProgress(userId);
    setTasks(t);
    setLoading(false);
  }

  async function updateTask(taskId: string, patch: Partial<ChecklistTask>) {
    if (!supabase || !session?.user.id) return;
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const next = { ...target, ...patch };
    setTasks((prev) => prev.map((t) => (t.id === taskId ? next : t)));

    const { data: row } = await supabase.from("tasks").select("id").eq("slug", taskId).single();
    if (!row) return;
    await supabase
      .from("task_progress")
      .update({
        status: next.status,
        completed: next.completed,
        completed_at: next.completed ? (next.completedAt ?? new Date().toISOString().slice(0, 10)) : null,
        notes: next.notes
      })
      .eq("user_id", session.user.id)
      .eq("task_id", row.id);

    if (patch.completed) {
      setFeedback(next.completed ? `✅ "${next.title}" marcada como completada` : `"${next.title}" marcada como pendiente`);
      setTimeout(() => setFeedback(""), 3000);
    }
  }

  const grouped = {
    1: tasks.filter((t) => t.week === 1),
    2: tasks.filter((t) => t.week === 2),
    3: tasks.filter((t) => t.week === 3)
  } as const;

  const weekProgress = (week: 1 | 2 | 3) => {
    const wt = grouped[week];
    if (!wt.length) return 0;
    return Math.round((wt.filter((t) => t.completed).length / wt.length) * 100);
  };

  const totalCompleted = tasks.filter((t) => t.completed).length;
  const totalProgress = tasks.length ? Math.round((totalCompleted / tasks.length) * 100) : 0;

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-accent" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sistema Base 21 días</h1>
        <p className="mt-1 text-sm text-muted">Tu guía paso a paso para profesionalizar el negocio. Cada tarea te explica qué hacer y por qué importa.</p>
      </div>

      {/* Overall progress */}
      <div className="rounded-xl border border-slate-800 bg-panel p-5">
        <div className="flex items-center justify-between">
          <p className="font-medium">Progreso general</p>
          <p className="text-2xl font-bold text-accent">{totalProgress}%</p>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-2.5 rounded-full bg-accent transition-all duration-500" style={{ width: `${totalProgress}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">{totalCompleted} de {tasks.length} tareas completadas</p>
      </div>

      {feedback && (
        <div className="rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-emerald-300">
          {feedback}
        </div>
      )}

      {/* Tutorial tip */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-slate-300">
        <p className="font-semibold text-accent">¿Cómo usar el checklist?</p>
        <p className="mt-1">Haz clic en cualquier tarea para ver la guía completa — qué hacer, un ejemplo real y el error más común. Márcala cuando la completes.</p>
      </div>

      {/* Weeks */}
      {([1, 2, 3] as const).map((week) => {
        const info = WEEK_INFO[week];
        const wProgress = weekProgress(week);
        const allDone = wProgress === 100;

        return (
          <div key={week} className={`rounded-xl border ${info.border} ${info.bg}`}>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${info.color}`}>{info.label}</span>
                    {allDone && <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs text-emerald-300">Completada ✓</span>}
                  </div>
                  <h2 className="mt-0.5 font-semibold">{info.title}</h2>
                </div>
                <p className={`text-xl font-bold ${info.color}`}>{wProgress}%</p>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div className={`h-1.5 rounded-full transition-all duration-500 ${allDone ? "bg-success" : "bg-accent"}`} style={{ width: `${wProgress}%` }} />
              </div>
            </div>

            <div className="divide-y divide-slate-800/50 border-t border-slate-800/50">
              {grouped[week].map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isExpanded={expanded === task.id}
                  onToggleExpand={() => setExpanded(expanded === task.id ? null : task.id)}
                  onChange={updateTask}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskRow({
  task,
  isExpanded,
  onToggleExpand,
  onChange
}: {
  task: ChecklistTask;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onChange: (id: string, patch: Partial<ChecklistTask>) => Promise<void>;
}) {
  const priorityColor = { alta: "text-red-400", media: "text-warning", baja: "text-slate-400" }[task.priority];

  return (
    <div className={`transition-colors ${task.completed ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-3 px-5 py-3">
        <button
          onClick={() => void onChange(task.id, {
            completed: !task.completed,
            status: !task.completed ? "hecho" : "pendiente",
            completedAt: !task.completed ? new Date().toISOString().slice(0, 10) : null
          })}
          className="shrink-0 text-slate-400 hover:text-accent transition-colors"
        >
          {task.completed
            ? <CheckCircle2 size={20} className="text-success" />
            : <Circle size={20} />}
        </button>

        <button onClick={onToggleExpand} className="flex-1 text-left">
          <p className={`text-sm font-medium ${task.completed ? "line-through text-muted" : ""}`}>{task.title}</p>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted">
            <span className={priorityColor}>Prioridad: {task.priority}</span>
            <span className="flex items-center gap-1"><Clock size={10} /> ~{task.estimateHours}h</span>
            {task.completedAt && <span>Completada: {task.completedAt}</span>}
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={task.status}
            onChange={(e) => void onChange(task.id, {
              status: e.target.value as TaskStatus,
              completed: e.target.value === "hecho",
              completedAt: e.target.value === "hecho" ? new Date().toISOString().slice(0, 10) : null
            })}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="hecho">Hecho</option>
          </select>
          <button onClick={onToggleExpand} className="text-muted hover:text-white">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mx-5 mb-4 space-y-3 rounded-xl border border-slate-700 bg-slate-900/50 p-4 text-sm">
          <GuideBlock label="¿Por qué importa?" content={task.why} color="text-blue-300" />
          <GuideBlock label="¿Cómo hacerlo?" content={task.how} color="text-slate-200" />
          <GuideBlock label="Ejemplo real" content={task.example} color="text-slate-300" />
          <GuideBlock label="Error más común" content={task.commonError} color="text-red-300" />
          <GuideBlock label="Acción recomendada" content={task.action} color="text-emerald-300" />

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">Mis notas</p>
            <textarea
              value={task.notes}
              onChange={(e) => void onChange(task.id, { notes: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs outline-none focus:border-accent"
              placeholder="Escribe tus apuntes, decisiones o pendientes de esta tarea..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

function GuideBlock({ label, content, color }: { label: string; content: string; color: string }) {
  return (
    <div>
      <p className="mb-0.5 text-xs font-semibold text-muted">{label}</p>
      <p className={color}>{content}</p>
    </div>
  );
}

import { checklistTasks } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { ChecklistTask, DbTask, DbTaskProgress, TaskStatus } from "@/lib/types";

export async function ensureCatalogAndProgress(userId: string): Promise<ChecklistTask[]> {
  if (!supabase) throw new Error("Supabase no configurado.");

  const catalogRows = checklistTasks.map((t) => ({
    slug: t.id,
    week: t.week,
    title: t.title,
    description: null,
    why: t.why,
    how: t.how,
    example: t.example,
    common_error: t.commonError,
    recommended_action: t.action,
    priority: t.priority,
    estimate_hours: t.estimateHours
  }));

  await supabase.from("tasks").upsert(catalogRows, { onConflict: "slug" });

  const { data: dbTasks, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .order("week", { ascending: true })
    .order("slug", { ascending: true });

  if (taskError) throw taskError;

  const tasks = (dbTasks ?? []) as DbTask[];
  if (tasks.length === 0) return [];

  const { data: progressData, error: progressError } = await supabase
    .from("task_progress")
    .select("*")
    .eq("user_id", userId);

  if (progressError) throw progressError;

  const progressRows = (progressData ?? []) as DbTaskProgress[];
  const existingByTask = new Map(progressRows.map((p) => [p.task_id, p]));

  const missing = tasks
    .filter((t) => !existingByTask.has(t.id))
    .map((t) => ({
      user_id: userId,
      task_id: t.id,
      status: "pendiente" as TaskStatus,
      completed: false,
      completed_at: null as string | null,
      notes: ""
    }));

  if (missing.length > 0) {
    await supabase.from("task_progress").insert(missing);
  }

  const { data: refreshedProgress, error: refreshedError } = await supabase
    .from("task_progress")
    .select("*")
    .eq("user_id", userId);

  if (refreshedError) throw refreshedError;

  const finalProgress = (refreshedProgress ?? []) as DbTaskProgress[];
  const progressByTask = new Map(finalProgress.map((p) => [p.task_id, p]));

  return tasks.map((t) => {
    const p = progressByTask.get(t.id);
    return {
      id: t.slug,
      week: t.week,
      title: t.title,
      status: p?.status ?? "pendiente",
      completed: p?.completed ?? false,
      completedAt: p?.completed_at ?? null,
      priority: t.priority,
      estimateHours: Number(t.estimate_hours),
      notes: p?.notes ?? "",
      why: t.why,
      how: t.how,
      example: t.example,
      commonError: t.common_error,
      action: t.recommended_action
    } satisfies ChecklistTask;
  });
}

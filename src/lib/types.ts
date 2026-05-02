export type TaskStatus = "pendiente" | "en_progreso" | "hecho";

export type ChecklistTask = {
  id: string;
  week: 1 | 2 | 3;
  title: string;
  status: TaskStatus;
  completed: boolean;
  completedAt: string | null;
  priority: "baja" | "media" | "alta";
  estimateHours: number;
  notes: string;
  why: string;
  how: string;
  example: string;
  commonError: string;
  action: string;
};

export type Template = {
  id: string;
  name: string;
  purpose: string;
};

export type Phase = {
  id: number;
  name: string;
  objective: string;
  tasks: string[];
  prerequisites: string[];
  estimate: string;
  status: "desbloqueado" | "bloqueado";
};

export type DbTask = {
  id: string;
  slug: string;
  week: 1 | 2 | 3;
  title: string;
  description: string | null;
  why: string;
  how: string;
  example: string;
  common_error: string;
  recommended_action: string;
  priority: "baja" | "media" | "alta";
  estimate_hours: number;
};

export type DbTaskProgress = {
  id: string;
  user_id: string;
  task_id: string;
  status: TaskStatus;
  completed: boolean;
  completed_at: string | null;
  notes: string;
};

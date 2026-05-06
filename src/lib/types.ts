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
  sample: string;
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

export type Product = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  base_price: number;
  active: boolean;
  created_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  name: string;
  price_adjustment: number;
};

export type SaleItem = {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  sale_date: string;
  created_at: string;
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

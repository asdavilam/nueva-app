create extension if not exists "pgcrypto";

create table if not exists business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  business_name text not null,
  city text,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  week smallint not null check (week between 1 and 3),
  title text not null,
  description text,
  why text not null,
  how text not null,
  example text not null,
  common_error text not null,
  recommended_action text not null,
  priority text not null check (priority in ('baja', 'media', 'alta')),
  estimate_hours numeric(5,2) not null default 1
);

create table if not exists task_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  task_id uuid not null references tasks(id) on delete cascade,
  status text not null check (status in ('pendiente', 'en_progreso', 'hecho')),
  completed boolean not null default false,
  completed_at date,
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, task_id)
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists finance_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  entry_type text not null check (entry_type in ('venta', 'gasto')),
  category text not null,
  amount numeric(12,2) not null,
  entry_date date not null default current_date,
  payment_method text,
  notes text default '',
  created_at timestamptz not null default now()
);

create table if not exists kpis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  period_month date not null,
  sales numeric(12,2) not null default 0,
  expenses numeric(12,2) not null default 0,
  customers integer not null default 0,
  tickets integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, period_month)
);

create table if not exists phases (
  id smallint primary key,
  name text not null,
  objective text not null,
  prerequisites text[] not null default '{}',
  estimate text not null,
  order_index smallint not null unique
);

create table if not exists phase_tasks (
  id uuid primary key default gen_random_uuid(),
  phase_id smallint not null references phases(id) on delete cascade,
  task text not null
);

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  purpose text not null
);

alter table business_profiles enable row level security;
alter table task_progress enable row level security;
alter table notes enable row level security;
alter table finance_entries enable row level security;
alter table kpis enable row level security;

create policy "owners can read business profile"
  on business_profiles for select
  using (auth.uid() = user_id);

create policy "owners can mutate business profile"
  on business_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owners can manage task progress"
  on task_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owners can manage notes"
  on notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owners can manage finance entries"
  on finance_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owners can manage kpis"
  on kpis for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

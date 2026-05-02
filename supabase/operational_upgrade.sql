-- Ejecuta este script en Supabase SQL Editor para dejar la app operativa con Auth + RLS.

alter table if exists tasks enable row level security;
alter table if exists phases enable row level security;
alter table if exists phase_tasks enable row level security;
alter table if exists templates enable row level security;

drop policy if exists "authenticated can read tasks" on tasks;
create policy "authenticated can read tasks"
  on tasks for select
  to authenticated
  using (true);

drop policy if exists "authenticated can write tasks" on tasks;
create policy "authenticated can write tasks"
  on tasks for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can read phases" on phases;
create policy "authenticated can read phases"
  on phases for select
  to authenticated
  using (true);

drop policy if exists "authenticated can read phase_tasks" on phase_tasks;
create policy "authenticated can read phase_tasks"
  on phase_tasks for select
  to authenticated
  using (true);

drop policy if exists "authenticated can read templates" on templates;
create policy "authenticated can read templates"
  on templates for select
  to authenticated
  using (true);

create index if not exists idx_task_progress_user_id on task_progress(user_id);
create index if not exists idx_finance_entries_user_id_date on finance_entries(user_id, entry_date);
create index if not exists idx_kpis_user_month on kpis(user_id, period_month);

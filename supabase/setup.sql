-- FOCUS//OS 2.2 — Supabase database setup
-- Execute este arquivo no SQL Editor do SEU projeto Supabase.
-- Não cole chaves secret/service_role neste arquivo nem no frontend.

create extension if not exists pgcrypto;
grant usage on schema public to authenticated;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title varchar(90) not null check (char_length(trim(title)) between 1 and 90),
  priority text not null check (priority in ('high', 'medium', 'low')),
  category text not null default 'other' check (category in ('work', 'study', 'personal', 'other')),
  due_date date,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_created_idx on public.tasks(user_id, created_at desc);
create index if not exists tasks_user_due_idx on public.tasks(user_id, due_date);

create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  completed_at timestamptz not null default now(),
  duration_minutes integer not null check (duration_minutes between 1 and 180),
  completed boolean not null default true
);

create index if not exists focus_sessions_user_completed_idx on public.focus_sessions(user_id, completed_at desc);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_goal integer not null default 3 check (daily_goal between 1 and 30),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists preferences_set_updated_at on public.user_preferences;
create trigger preferences_set_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();


-- Impede que uma sessão de um usuário seja vinculada a uma tarefa de outra conta.
create or replace function public.ensure_focus_session_task_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.task_id is not null and not exists (
    select 1 from public.tasks t
    where t.id = new.task_id and t.user_id = new.user_id
  ) then
    raise exception 'A missão vinculada não pertence a esta conta.' using errcode = '23503';
  end if;
  return new;
end;
$$;

drop trigger if exists focus_sessions_validate_task_owner on public.focus_sessions;
create trigger focus_sessions_validate_task_owner
before insert or update of task_id, user_id on public.focus_sessions
for each row execute function public.ensure_focus_session_task_owner();

-- Segurança: cada usuário só pode acessar registros cujo user_id seja o próprio auth.uid().
alter table public.tasks enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "Users manage their own tasks" on public.tasks;
create policy "Users manage their own tasks"
on public.tasks for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users read their own focus sessions" on public.focus_sessions;
create policy "Users read their own focus sessions"
on public.focus_sessions for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users add their own focus sessions" on public.focus_sessions;
create policy "Users add their own focus sessions"
on public.focus_sessions for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete their own focus sessions" on public.focus_sessions;
create policy "Users delete their own focus sessions"
on public.focus_sessions for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users manage their own preferences" on public.user_preferences;
create policy "Users manage their own preferences"
on public.user_preferences for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, delete on public.focus_sessions to authenticated;
grant select, insert, update on public.user_preferences to authenticated;

-- Habilita eventos Realtime para sincronizar alterações entre abas/dispositivos.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tasks') then
      execute 'alter publication supabase_realtime add table public.tasks';
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'focus_sessions') then
      execute 'alter publication supabase_realtime add table public.focus_sessions';
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_preferences') then
      execute 'alter publication supabase_realtime add table public.user_preferences';
    end if;
  end if;
end;
$$;

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.todos enable row level security;

create policy "Users can manage their own todos"
  on public.todos
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

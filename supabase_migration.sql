-- ============================================================
-- FinançasPro — Supabase SQL Migration
-- Execute no SQL Editor do Supabase
-- ============================================================

-- TABELA: transactions
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount      numeric(12,2) not null,
  type        text not null check (type in ('income','expense')),
  category    text not null default 'Outros',
  date        date not null,
  created_at  timestamptz default now()
);

-- TABELA: pendencies
create table if not exists public.pendencies (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount      numeric(12,2) not null,
  due_date    date not null,
  category    text not null default 'Outros',
  paid        boolean not null default false,
  created_at  timestamptz default now()
);

-- ÍNDICES para performance
create index if not exists transactions_user_date on public.transactions(user_id, date);
create index if not exists pendencies_user_due   on public.pendencies(user_id, due_date);

-- ============================================================
-- Row Level Security — cada usuário só vê os próprios dados
-- ============================================================

alter table public.transactions enable row level security;
alter table public.pendencies   enable row level security;

-- Transactions policies
create policy "transactions: select own" on public.transactions
  for select using (auth.uid() = user_id);

create policy "transactions: insert own" on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "transactions: delete own" on public.transactions
  for delete using (auth.uid() = user_id);

-- Pendencies policies
create policy "pendencies: select own" on public.pendencies
  for select using (auth.uid() = user_id);

create policy "pendencies: insert own" on public.pendencies
  for insert with check (auth.uid() = user_id);

create policy "pendencies: update own" on public.pendencies
  for update using (auth.uid() = user_id);

create policy "pendencies: delete own" on public.pendencies
  for delete using (auth.uid() = user_id);

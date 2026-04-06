-- ================================================================
-- BudgetPilot — Full Database Schema
-- Run once in your Supabase SQL editor.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / ON CONFLICT.
-- ================================================================


-- ----------------------------------------------------------------
-- 0. Extensions
-- ----------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid() fallback


-- ================================================================
-- 1. PROFILES
--    One row per auth.users entry, created automatically on signup.
-- ================================================================
create table if not exists public.profiles (
  id                      uuid        primary key references auth.users(id) on delete cascade,
  email                   text        not null,
  full_name               text,
  first_name              text,
  last_name               text,
  phone                   text,
  marketing_email_consent boolean     not null default false,
  marketing_sms_consent   boolean     not null default false,
  avatar_url              text,
  currency                char(3)     not null default 'USD',   -- ISO 4217
  plan                    text        not null default 'free' check (plan in ('free', 'pro')),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

comment on table  public.profiles             is 'Public profile data for each authenticated user.';
comment on column public.profiles.currency    is 'Preferred display currency (ISO 4217).';
comment on column public.profiles.plan        is 'Subscription plan: free (default) or pro.';

-- Migration for existing databases (safe to re-run)
alter table public.profiles add column if not exists plan                    text    not null default 'free' check (plan in ('free', 'pro'));
alter table public.profiles add column if not exists first_name              text;
alter table public.profiles add column if not exists last_name               text;
alter table public.profiles add column if not exists phone                   text;
alter table public.profiles add column if not exists marketing_email_consent boolean not null default false;
alter table public.profiles add column if not exists marketing_sms_consent   boolean not null default false;

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, first_name, last_name, phone, marketing_email_consent, marketing_sms_consent, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'marketing_email_consent')::boolean, false),
    coalesce((new.raw_user_meta_data->>'marketing_sms_consent')::boolean, false),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep updated_at current
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();


-- ================================================================
-- 2. CATEGORIES
--    Shared default categories (is_default = true, user_id = null)
--    plus per-user custom categories.
-- ================================================================
create table if not exists public.categories (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        references public.profiles(id) on delete cascade,
  name          text        not null,
  type          text        not null check (type in ('income', 'expense')),
  color         char(7)     not null default '#6b7280',  -- hex color
  icon          text        not null default 'circle',
  is_default    boolean     not null default false,
  sort_order    smallint    not null default 0,
  created_at    timestamptz not null default now(),

  -- A user cannot have two categories with the same name + type
  constraint uq_user_category unique nulls not distinct (user_id, name, type)
);

comment on table  public.categories           is 'Income and expense categories. Rows with user_id = NULL are global defaults.';
comment on column public.categories.is_default is 'True for built-in categories seeded by the system (user_id must be NULL).';

create index if not exists idx_categories_user_type on public.categories (user_id, type);


-- ================================================================
-- 3. INCOMES
--    Each row is one income event for a user.
-- ================================================================
create table if not exists public.incomes (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  category_id   uuid        references public.categories(id) on delete set null,
  amount        numeric(14,2) not null check (amount > 0),
  description   text,
  date          date        not null default current_date,
  is_recurring  boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table  public.incomes              is 'Income entries per user.';
comment on column public.incomes.is_recurring is 'Informational flag; recurring logic is handled in the app layer.';

create index if not exists idx_incomes_user_date     on public.incomes (user_id, date desc);
create index if not exists idx_incomes_user_category on public.incomes (user_id, category_id);

drop trigger if exists incomes_updated_at on public.incomes;
create trigger incomes_updated_at
  before update on public.incomes
  for each row execute procedure public.set_updated_at();


-- ================================================================
-- 4. EXPENSES
--    Each row is one expense event for a user.
-- ================================================================
create table if not exists public.expenses (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  category_id   uuid        references public.categories(id) on delete set null,
  amount        numeric(14,2) not null check (amount > 0),
  description   text,
  date          date        not null default current_date,
  is_recurring  boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.expenses is 'Expense entries per user.';

create index if not exists idx_expenses_user_date     on public.expenses (user_id, date desc);
create index if not exists idx_expenses_user_category on public.expenses (user_id, category_id);

drop trigger if exists expenses_updated_at on public.expenses;
create trigger expenses_updated_at
  before update on public.expenses
  for each row execute procedure public.set_updated_at();


-- ================================================================
-- 5. UNIFIED VIEW  (optional convenience — app uses it for charts)
--    Merges incomes + expenses into a single queryable set.
-- ================================================================
create or replace view public.transactions as
  select
    id, user_id, category_id, amount, description, date,
    is_recurring, created_at, updated_at,
    'income'::text  as type
  from public.incomes
  union all
  select
    id, user_id, category_id, amount, description, date,
    is_recurring, created_at, updated_at,
    'expense'::text as type
  from public.expenses;

comment on view public.transactions is 'Read-only union of incomes and expenses. Do not INSERT/UPDATE here.';


-- ================================================================
-- 6. ROW LEVEL SECURITY
-- ================================================================

alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.incomes    enable row level security;
alter table public.expenses   enable row level security;

-- ── Profiles ────────────────────────────────────────────────────
drop policy if exists "profiles: own row"     on public.profiles;
create policy "profiles: own row" on public.profiles
  for all using (id = auth.uid());

-- ── Categories ──────────────────────────────────────────────────
drop policy if exists "categories: read defaults + own" on public.categories;
create policy "categories: read defaults + own" on public.categories
  for select using (is_default = true or user_id = auth.uid());

drop policy if exists "categories: insert own"  on public.categories;
create policy "categories: insert own" on public.categories
  for insert with check (user_id = auth.uid() and is_default = false);

drop policy if exists "categories: update own"  on public.categories;
create policy "categories: update own" on public.categories
  for update using (user_id = auth.uid());

drop policy if exists "categories: delete own"  on public.categories;
create policy "categories: delete own" on public.categories
  for delete using (user_id = auth.uid());

-- ── Incomes ─────────────────────────────────────────────────────
drop policy if exists "incomes: own rows" on public.incomes;
create policy "incomes: own rows" on public.incomes
  for all using (user_id = auth.uid());

-- ── Expenses ────────────────────────────────────────────────────
drop policy if exists "expenses: own rows" on public.expenses;
create policy "expenses: own rows" on public.expenses
  for all using (user_id = auth.uid());


-- ================================================================
-- 7. SEED — Default Categories
--    Uses a fixed deterministic UUID so re-runs are idempotent.
-- ================================================================
insert into public.categories
  (id, name, type, color, icon, is_default, sort_order)
values
  -- Income
  ('00000001-0000-0000-0000-000000000001', 'Salary',        'income',  '#22c55e', 'briefcase',       true, 10),
  ('00000001-0000-0000-0000-000000000002', 'Freelance',     'income',  '#16a34a', 'laptop',          true, 20),
  ('00000001-0000-0000-0000-000000000003', 'Investment',    'income',  '#4ade80', 'trending-up',     true, 30),
  ('00000001-0000-0000-0000-000000000004', 'Bonus',         'income',  '#86efac', 'gift',            true, 40),
  ('00000001-0000-0000-0000-000000000005', 'Rental',        'income',  '#bbf7d0', 'building',        true, 50),
  ('00000001-0000-0000-0000-000000000006', 'Other Income',  'income',  '#6b7280', 'plus-circle',     true, 99),
  -- Expense
  ('00000002-0000-0000-0000-000000000001', 'Housing',       'expense', '#ef4444', 'home',            true, 10),
  ('00000002-0000-0000-0000-000000000002', 'Food',          'expense', '#f97316', 'utensils',        true, 20),
  ('00000002-0000-0000-0000-000000000003', 'Transport',     'expense', '#eab308', 'car',             true, 30),
  ('00000002-0000-0000-0000-000000000004', 'Health',        'expense', '#ec4899', 'heart',           true, 40),
  ('00000002-0000-0000-0000-000000000005', 'Shopping',      'expense', '#8b5cf6', 'shopping-bag',    true, 50),
  ('00000002-0000-0000-0000-000000000006', 'Entertainment', 'expense', '#06b6d4', 'tv',              true, 60),
  ('00000002-0000-0000-0000-000000000007', 'Education',     'expense', '#3b82f6', 'book',            true, 70),
  ('00000002-0000-0000-0000-000000000008', 'Utilities',     'expense', '#f59e0b', 'zap',             true, 80),
  ('00000002-0000-0000-0000-000000000009', 'Subscriptions', 'expense', '#a855f7', 'repeat',          true, 90),
  ('00000002-0000-0000-0000-00000000000a', 'Other Expense', 'expense', '#6b7280', 'more-horizontal', true, 99)
on conflict (id) do update
  set name = excluded.name, color = excluded.color, icon = excluded.icon, sort_order = excluded.sort_order;


-- ================================================================
-- 8. ADMIN — is_admin flag + last_seen_at heartbeat
-- ================================================================
alter table public.profiles add column if not exists is_admin     boolean     not null default false;
alter table public.profiles add column if not exists last_seen_at timestamptz;

-- Security-definer helper so admin RLS policies don't recurse into themselves.
create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Admins can read every profile row.
drop policy if exists "profiles: admin read all"   on public.profiles;
create policy "profiles: admin read all" on public.profiles
  for select using (public.is_current_user_admin());

-- Admins can update every profile row (e.g. toggle plan).
drop policy if exists "profiles: admin update all" on public.profiles;
create policy "profiles: admin update all" on public.profiles
  for update using (public.is_current_user_admin());


-- ================================================================
-- 9. BUDGETS
--    Monthly budget cap per category, per user.
-- ================================================================
create table if not exists public.budgets (
  id            uuid          primary key default gen_random_uuid(),
  user_id       uuid          not null references public.profiles(id) on delete cascade,
  category_id   uuid          not null references public.categories(id) on delete cascade,
  amount        numeric(14,2) not null check (amount > 0),
  month         smallint      not null check (month between 1 and 12),
  year          smallint      not null,
  created_at    timestamptz   not null default now(),
  updated_at    timestamptz   not null default now(),

  -- One budget per category per month per user
  constraint uq_budget unique (user_id, category_id, month, year)
);

comment on table public.budgets is 'Monthly spending caps per category per user.';

create index if not exists idx_budgets_user_month on public.budgets (user_id, year, month);

drop trigger if exists budgets_updated_at on public.budgets;
create trigger budgets_updated_at
  before update on public.budgets
  for each row execute procedure public.set_updated_at();

alter table public.budgets enable row level security;

drop policy if exists "budgets: own rows" on public.budgets;
create policy "budgets: own rows" on public.budgets
  for all using (user_id = auth.uid());

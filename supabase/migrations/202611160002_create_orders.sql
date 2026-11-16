create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_email text not null,
  customer_name text not null,
  vehicle_registration text not null check (char_length(vehicle_registration) between 2 and 8),
  plan text not null check (plan in ('daily', 'weekly', 'monthly')),
  amount_pence integer not null check (amount_pence in (2000, 10000, 25000)),
  currency text not null default 'gbp' check (currency = 'gbp'),
  cover_start timestamptz not null,
  cover_end timestamptz not null,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  payment_status text not null default 'paid' check (payment_status in ('paid', 'refunded')),
  order_reference text not null unique,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "Customers can view their own orders" on public.orders;
create policy "Customers can view their own orders"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid());

revoke all on public.orders from anon;
grant select on public.orders to authenticated;

create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

-- Stripe webhooks and Edge Functions use the Supabase service role to write orders.
-- The browser can only read orders belonging to its authenticated customer.

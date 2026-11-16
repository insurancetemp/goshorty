alter table public.orders
  add column if not exists email_sent_at timestamptz;

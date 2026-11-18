-- Allow administrator-created complimentary orders without a Stripe checkout session.
alter table public.orders
  alter column stripe_checkout_session_id drop not null;

alter table public.orders
  drop constraint if exists orders_amount_pence_check,
  add constraint orders_amount_pence_check
    check (amount_pence in (0, 2000, 10000, 25000));

alter table public.orders
  drop constraint if exists orders_payment_status_check,
  add constraint orders_payment_status_check
    check (payment_status in ('paid', 'refunded', 'complimentary'));

alter table public.orders
  add column if not exists admin_created_by uuid references auth.users(id) on delete set null;

create index if not exists orders_admin_created_by_idx
  on public.orders (admin_created_by);

-- Keep applicant personal and vehicle details in a private table until payment completes.
create table if not exists public.checkout_applications (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  driver_date_of_birth date not null,
  customer_address text not null,
  driving_license_number text not null,
  vehicle_registration text not null,
  vehicle_make text not null,
  vehicle_model text not null,
  vehicle_colour text not null,
  fuel_type text not null,
  plan text not null check (plan in ('daily','weekly','monthly')),
  cover_start timestamptz not null,
  cover_end timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.checkout_applications enable row level security;
revoke all on table public.checkout_applications from anon, authenticated;

alter table public.orders
  add column if not exists customer_address text,
  add column if not exists driving_license_number text,
  add column if not exists vehicle_make text,
  add column if not exists vehicle_model text,
  add column if not exists vehicle_colour text,
  add column if not exists fuel_type text;

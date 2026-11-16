alter table public.orders
  add column if not exists customer_phone text,
  add column if not exists driver_date_of_birth date;

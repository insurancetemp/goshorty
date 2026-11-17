-- Store the vehicle's model year with each application and paid order.
alter table public.checkout_applications
  add column if not exists vehicle_year integer;

alter table public.orders
  add column if not exists vehicle_year integer;

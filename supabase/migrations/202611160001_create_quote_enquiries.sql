-- GoShorty temporary car insurance enquiry schema.
-- This migration intentionally grants no access to browser/anonymous roles.
-- Do not enable public inserts until consent wording, privacy notice,
-- anti-abuse controls and a reviewed retention policy are in place.

create table if not exists public.quote_enquiries (
  id uuid primary key default gen_random_uuid(),
  vehicle_registration text not null check (char_length(vehicle_registration) between 2 and 8),
  cover_start timestamptz not null,
  cover_duration text not null check (
    cover_duration in ('1 hour', '2 hours', '4 hours', '1 day', '2 days', '1 week', '2 weeks', 'Up to 28 days')
  ),
  created_at timestamptz not null default now()
);

alter table public.quote_enquiries enable row level security;

revoke all on table public.quote_enquiries from anon, authenticated;

-- No SELECT, INSERT, UPDATE or DELETE policies are created here.
-- Add narrowly scoped policies only after deciding how enquiries will be
-- collected, protected from spam, accessed by staff and deleted on schedule.
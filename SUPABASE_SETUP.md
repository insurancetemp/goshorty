# Supabase connection

The project URL has been set in `.env.example`. Add your publishable key locally and in your hosting environment:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://koaseuqmbelvxuzrvwnv.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

For local development, copy `.env.example` to `.env.local` and replace the placeholder. Do not commit `.env.local`.

For Vercel, add both variables under Project Settings → Environment Variables, then redeploy.

The publishable key is intended for public application code. Never put a Supabase secret/service-role key in a `NEXT_PUBLIC_*` variable or in GitHub.

## Database schema

The initial enquiry table is in `supabase/migrations/202611160001_create_quote_enquiries.sql`. Review and run it in Supabase SQL Editor when ready.

The migration enables Row Level Security and intentionally grants no browser access. This is deliberate: vehicle registrations and quote enquiries should not be accepted into a publicly writable table until the privacy notice, user consent, anti-spam controls, staff access and retention policy are agreed.

The current quote form remains a demonstration and does not save data or request a real insurance quote.
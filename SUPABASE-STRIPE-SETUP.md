# GoShorty: GitHub Pages + Supabase + Stripe

The website remains a static Next.js export deployed by GitHub Pages. Supabase Edge Functions provide the secure server-side integration with Stripe.

## 1. Apply the database migration

From the repository root, with the Supabase CLI linked to project `koaseuqmbelvxuzrvwnv`:

```sh
supabase link --project-ref koaseuqmbelvxuzrvwnv
supabase db push
```

This creates the customer order table and row-level security policy.

## 2. Configure Supabase secrets

Set these in Supabase Dashboard → Project Settings → Edge Functions → Secrets (or with `supabase secrets set`):

- `STRIPE_SECRET_KEY` — Stripe secret key (use test mode first)
- `STRIPE_WEBHOOK_SECRET` — signing secret for the webhook endpoint
- `SITE_URL` — `https://insurancetemp.github.io/goshorty`
- `RESEND_API_KEY` — Resend API key used for confirmation emails
- `EMAIL_FROM` — verified sender, e.g. `GoShorty <orders@your-verified-domain.example>`

Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions in the hosted environment. Do not put the service-role key or Stripe secret in GitHub or browser code.

## 3. Deploy the Edge Functions

```sh
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

The checkout function creates a Stripe-hosted Checkout Session. The webhook verifies the Stripe signature and records completed payments. It creates a Supabase Auth customer and emails a password setup link and order summary through Resend.

## 4. Configure Stripe webhook

In Stripe Dashboard → Developers → Webhooks, add this endpoint:

`https://koaseuqmbelvxuzrvwnv.supabase.co/functions/v1/stripe-webhook`

Subscribe to `checkout.session.completed`. Copy the endpoint's signing secret into the Supabase `STRIPE_WEBHOOK_SECRET` secret.

Use Stripe test mode until the full flow has been tested.

## 5. Configure GitHub Pages browser settings

Set these GitHub Actions repository variables (Settings → Secrets and variables → Actions → Variables):

- `NEXT_PUBLIC_SUPABASE_URL` = `https://koaseuqmbelvxuzrvwnv.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = your Supabase publishable key

The current workflow builds the static website. Ensure those variables are available to the build step if you prefer not to keep the public values in the project environment file. The publishable key is designed for browser use; RLS protects customer orders.

## 6. Configure Supabase Auth URLs

In Supabase Authentication → URL Configuration:

- Site URL: `https://insurancetemp.github.io/goshorty`
- Add redirect URL: `https://insurancetemp.github.io/goshorty/set-password/`

The Resend sender domain must be verified before email delivery will work.

## Fixed demo prices

The Edge Function independently validates the plan and calculates prices server-side:

- Daily: £20
- Weekly: £100
- Monthly: £250 (30 days)

Never accept a price or amount supplied by the browser.

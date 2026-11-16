# GoShorty website rebuild

A Next.js App Router starter for a temporary car insurance website.

## Included in this first milestone

- Responsive homepage
- Temporary car insurance content only
- Quote form UI (demo only; no live insurer quote is requested)
- How-it-works section
- FAQ accordion
- Mobile navigation layout and responsive styling
- Basic metadata and project configuration

## Run locally

Requirements: Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Important before launch

This is a frontend prototype. It does **not** provide insurance quotes, bind cover, take payments, or issue policy documents. The quote form deliberately displays a notice until a legitimate insurer/broker API and the required permissions are configured.

Do not publish claims about insurer availability, policy features, pricing, eligibility, FCA status, customer reviews, or cover unless they have been independently verified for the new business.

## Planned integrations

- Supabase: database, authentication and secure server-side operations
- Resend: transactional email from verified sending domains
- Insurer/broker quote API: eligibility, pricing, purchase and policy documents

Keep all secret keys in local environment variables and the hosting provider's encrypted environment settings. Never commit secrets to GitHub.

## Free-tier note

The project uses open-source software. GitHub, Vercel, Supabase and Resend have free plans or allowances subject to their current limits and terms. Production insurance integrations, regulatory requirements, email volume, hosting usage and domain registration may involve costs.
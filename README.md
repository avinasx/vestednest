# Vested Nest

Marketing site and loan inquiry form for Vested Nest, backed by [Realie](https://docs.realie.ai/introduction) property data and [Supabase](https://supabase.com) (project: **vestednest**).

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from [Supabase Dashboard](https://supabase.com/dashboard/project/axtzwpoosurrtmhidbsm/settings/api)
- `REALIE_API_KEY` — from [Realie API Dashboard](https://app.realie.ai/developer/)

### Google Auth (Supabase)

1. In Supabase Dashboard → **Authentication** → **Providers** → enable **Google**.
2. Add your Google OAuth client ID/secret from Google Cloud Console.
3. Set **Redirect URL** to: `https://<project-ref>.supabase.co/auth/v1/callback`
4. In **URL Configuration**, add site URL `http://localhost:3000` and redirect `http://localhost:3000/auth/callback`.

## Database migrations

Migrations live in `supabase/migrations/`. Applied to remote via Supabase MCP; re-apply locally with:

```bash
npx supabase db push
```

## Develop

```bash
npm run dev
```

Submit the homepage form to run a [Realie address lookup](https://docs.realie.ai/api-reference/property/address-lookup) and save the inquiry to `loan_inquiries`.

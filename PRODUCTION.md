# Vested Nest — Production Checklist

Vested Nest is a production DSCR lending application. This document lists what **you must provide** before going live and **where each secret belongs**.

## Secrets placement matrix

| Variable / setting key | GitHub | Vercel | `platform_settings` | `.env.local` |
|----------------------|:------:|:------:|:-------------------:|:------------:|
| `SUPABASE_DB_URL` | **yes** (CI only) | — | — | optional (local `db push`) |
| `NEXT_PUBLIC_SUPABASE_URL` | — | **yes** | — | **yes** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | — | **yes** | — | **yes** |
| `SUPABASE_SERVICE_ROLE_KEY` | — | **yes** | — | **yes** |
| `SUPERADMIN_EMAILS` | — | **yes** | — | **yes** |
| `NEXT_PUBLIC_APP_URL` | — | optional | `app.base_url` | optional |
| `ai.gemini_api_key` | — | — | **yes** | optional (seed) |
| `ai.gemini_model` | — | — | **yes** | optional |
| `ai.langsmith_api_key` | — | — | **yes** | optional (seed) |
| `data.realie_api_key` | — | — | **yes** | optional (seed) |
| `data.rentcast_api_key` | — | — | **yes** | optional (seed) |
| `memory.supermemory_api_key` | — | — | **yes** | optional (seed) |
| `email.sendgrid_api_key` | — | — | **yes** | optional (seed) |
| `email.sendgrid_from` | — | — | **yes** | optional |
| `twilio.account_sid` | — | — | **yes** | optional (seed) |
| `twilio.auth_token` | — | — | **yes** | optional (seed) |
| `twilio.phone_number` | — | — | **yes** | optional (seed) |
| `credit.vendor_api_key` | — | — | **yes** | optional (seed) |

**Rules**

- **GitHub Actions** — only `SUPABASE_DB_URL` (session pooler URI for `supabase db push` in CI). Never put integration API keys in GitHub secrets or workflow `env`.
- **Vercel** — infrastructure (Supabase + superadmin emails) only. Integration keys live in `platform_settings`, not Vercel env.
- **`platform_settings`** — all third-party integration keys; editable at **Admin → Settings → Integrations** (`/admin/settings`). Runtime resolver merges DB values over `process.env` (local dev fallback).
- **`.env.local`** — gitignored local mirror: all of Vercel (A) plus B values for `npm run seed:platform-settings` and offline dev.

### Seed integrations into production

```bash
# One-time after setting B keys in .env.local (needs A keys too):
npm run seed:platform-settings

# Overwrite existing DB values from .env.local:
npm run seed:platform-settings -- --overwrite
```

Or enter keys manually in **Admin → Settings → Integrations** (superadmin required).

## Required — Core Platform

| Item | Where | Notes |
|------|-------|-------|
| Supabase project | Vercel + `.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Supabase service role | Vercel + `.env.local` | `SUPABASE_SERVICE_ROLE_KEY` — server-side only |
| Superadmin emails | Vercel + `.env.local` | `SUPERADMIN_EMAILS` — comma-separated, auto-promoted on Google sign-in |
| Google OAuth | Supabase Dashboard → Auth → Google | Redirect URLs: `/auth/callback`, `/auth/popup-done` |

## Required — Nest AI & Property Data

Configure in **Admin → Settings → Integrations** (`platform_settings`):

| Setting key | Notes |
|-------------|-------|
| `ai.gemini_api_key` | Powers Nest AI chat agent (LangGraph). `GOOGLE_API_KEY` accepted as seed alias. |
| `ai.langsmith_api_key` | Optional LangSmith tracing/evals for Nest AI. Sets `LANGSMITH_TRACING=true` when configured. |
| `data.realie_api_key` | Property parcel data, address autocomplete |
| `data.rentcast_api_key` | Rent comp enrichment (optional but recommended) |

## Document Types (Two Systems)

Vested Nest uses two separate document pipelines. **Never commit raw confidential PDFs to git.**

### Type 1: Logic Documents (underwriting engine)

Drives `lib/dscr.ts`, `lib/eligibility.ts`, and Nest AI `check_state_eligibility`.

| Admin path | `/admin/logic` |
| Table | `logic_documents` |
| Storage bucket | `logic-docs` (Supabase, private) |

Contains: underwriting guidelines, program matrices, state licensing, rate sheets (sanitized extracts only).

- Parsed rules sync to `admin_settings.state_eligibility` and `admin_settings.rate_settings`
- Conflict flags surface when guideline vs rate-sheet values disagree
- Wholesale lender names are stripped before storage (`lib/sanitize.ts`)

Seed from stakeholder folder:

```bash
DOCS_DIR=/path/to/vestednest-docs npm run seed:stakeholder-docs
```

Sanitized rule snapshot: `data/active-logic-rules.json`

### Type 2: Knowledge Base Documents (chat RAG)

Powers Nest AI `search_knowledge_base` via Supermemory vector store.

| Admin path | `/admin/knowledge` |
| Table | `knowledge_documents` |
| Storage bucket | `knowledge-docs` (Supabase, private) |

Supports: markdown, PDF extract, docx extract, URL. On add/update/delete/reindex, content is sanitized then synced to Supermemory.

**Lender confidentiality:** Nest AI system prompt forbids surfacing wholesale lender names in consumer-facing output.

## Required — Knowledge Base

| Setting key | Notes |
|-------------|-------|
| `memory.supermemory_api_key` | KB sync + conversation memory. Fallback: Supabase text search. |

FAQ-style content (product policies, state eligibility explainers) goes in **Knowledge Base** at `/admin/knowledge`.

## Required — Rate Engine Data

Rate parameters are derived from logic documents (rate sheets) and editable at **Admin → Logic Engine** (`/admin/logic`) or **Admin → Settings**:

- Base rate (from rate sheet, e.g. 6.500% par 30yr fixed)
- FICO band adjustments
- Borrower type overlays (LLC, individual, foreign national)
- Purpose adjustments (purchase, cash-out, refi, bridge)
- Per-state rate adjustments
- State eligibility matrix (blocked: ND, SD; attestation: NJ, NY; LLC-only: VA)

## Required — Legal & Compliance

You must provide (not in codebase):

- [ ] Lending licenses per state
- [ ] Privacy policy URL
- [ ] Terms of service
- [ ] E-sign / consent language for soft credit pull
- [ ] Indicative term sheet disclaimers (review with counsel)
- [ ] TCPA consent for outbound calls (if using Twilio)

## Email — Term Sheet Delivery

| Setting key | Notes |
|-------------|-------|
| `email.sendgrid_api_key` | Without this, emails are queued/logged only |
| `email.sendgrid_from` | Domain authentication (DKIM/SPF) required for deliverability |

## Optional — Telephony

| Setting key | Notes |
|-------------|-------|
| `twilio.account_sid`, `twilio.auth_token` | Enables Call button on close tracker |
| `twilio.phone_number` | Outbound caller ID |
| `app.base_url` / `NEXT_PUBLIC_APP_URL` | Twilio webhook callbacks (Vercel sets `VERCEL_URL` automatically) |

## Optional — Credit

| Setting key | Notes |
|-------------|-------|
| `credit.vendor_api_key` | Soft pull at pre-qual. Stub captures consent until configured. |

## Optional — LOS Integration

Not yet wired. You will need:

- LOS API credentials (Encompass, Calyx, etc.)
- Webhook endpoints for status sync
- Loan officer SSO mapping

## Loan Officer Roster

Add via **Admin → Settings**:

- Name, email, phone per LO
- Assign to applications (manual or automated — assignment rules TBD)

## Admin Access

1. Set `SUPERADMIN_EMAILS=your@email.com` in Vercel (and `.env.local` for dev)
2. Sign in with Google at `/login?next=/admin`
3. First login auto-promotes to superadmin
4. Admin URL: **`/admin`**

## Deployment (Vercel)

Set **infrastructure env vars only** in Vercel project settings (see matrix above). Integration keys belong in `platform_settings`, not Vercel.

Migrations run via GitHub Action on push to `main` using the `SUPABASE_DB_URL` repository secret.

## Migrations

```bash
supabase db push --db-url "$SUPABASE_DB_URL"
```

### GitHub Actions secret: `SUPABASE_DB_URL`

GitHub-hosted runners do **not** have reliable IPv6. The direct database host (`db.<project-ref>.supabase.co:5432`) resolves to IPv6 and fails in CI with `network is unreachable`.

Use the **Session pooler** connection string from Supabase Dashboard → **Project Settings → Database → Connection string → Session mode**:

```
postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

- Project ref for this repo: `axtzwpoosurrtmhidbsm` (also in `supabase/config.toml`)
- Replace `<password>` with the database password (URL-encode special characters)
- Replace `<region>` with your pooler region (e.g. `us-east-1`)

Add this full URI as the `SUPABASE_DB_URL` repository secret. The workflow rejects direct `db.*.supabase.co:5432` URLs to catch misconfiguration early.

For local `supabase db push`, either the session pooler URI or direct connection works on most developer machines.

### GitHub secrets to remove (if present)

Integration keys must **not** be in GitHub. If any of these exist under **Settings → Secrets and variables → Actions**, delete them:

- `REALIE_API_KEY`, `RENTCAST_API_KEY`, `GEMINI_API_KEY`, `GOOGLE_API_KEY`
- `SUPERMEMORY_API_KEY`, `SENDGRID_API_KEY`, `TWILIO_*`, `CREDIT_VENDOR_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_*` (belong on Vercel, not GitHub)

As of the last audit, only `SUPABASE_DB_URL` was configured — which is correct.

Migrations include: `profiles.role`, `applications`, `knowledge_documents`, `logic_documents`, `loan_officers`, `admin_settings` (with `state_eligibility`), `platform_settings`, RLS policies.

# Vested Nest — Production Checklist

Vested Nest is a production DSCR lending application. This document lists what **you must provide** before going live.

## Required — Core Platform

| Item | Env var | Notes |
|------|---------|-------|
| Supabase project | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Run migrations: `supabase db push` |
| Supabase service role | `SUPABASE_SERVICE_ROLE_KEY` | Server-side writes, admin ops. **Never expose to client.** |
| Superadmin emails | `SUPERADMIN_EMAILS` | Comma-separated. Auto-promoted on Google sign-in. |
| Google OAuth | Supabase Dashboard → Auth → Google | Redirect URLs: `/auth/callback`, `/auth/popup-done` |

## Required — Nest AI & Property Data

| Item | Env var | Notes |
|------|---------|-------|
| Google Gemini API key | `GOOGLE_API_KEY` or `GEMINI_API_KEY` | Powers Nest AI chat agent |
| Realie API key | `REALIE_API_KEY` | Property parcel data, address autocomplete |
| RentCast API key | `RENTCAST_API_KEY` | Rent comp enrichment (optional but recommended) |

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

| Item | Env var | Notes |
|------|---------|-------|
| Supermemory API key | `SUPERMEMORY_API_KEY` | KB sync + conversation memory. Fallback: Supabase text search. |

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

| Item | Env var | Notes |
|------|---------|-------|
| SendGrid API key | `SENDGRID_API_KEY` | Without this, emails are queued/logged only |
| Verified sender | `SENDGRID_FROM_EMAIL` | Domain authentication (DKIM/SPF) required for deliverability |

## Optional — Telephony

| Item | Env var | Notes |
|------|---------|-------|
| Twilio account | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | Enables Call button on close tracker |
| Twilio phone number | `TWILIO_PHONE_NUMBER` | Outbound caller ID |
| App URL | `NEXT_PUBLIC_APP_URL` | Twilio webhook callbacks |

## Optional — Credit

| Item | Env var | Notes |
|------|---------|-------|
| Credit vendor API | `CREDIT_VENDOR_API_KEY` | Soft pull at pre-qual. Stub captures consent until configured. |

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

1. Set `SUPERADMIN_EMAILS=your@email.com` in env
2. Sign in with Google at `/login?next=/admin`
3. First login auto-promotes to superadmin
4. Admin URL: **`/admin`**

## Deployment (Vercel)

Set all env vars in Vercel project settings. Run Supabase migration on deploy via GitHub Action (`SUPABASE_DB_URL` secret).

## Migrations

```bash
supabase db push --db-url "$SUPABASE_DB_URL"
```

Migrations include: `profiles.role`, `applications`, `knowledge_documents`, `logic_documents`, `loan_officers`, `admin_settings` (with `state_eligibility`), RLS policies.

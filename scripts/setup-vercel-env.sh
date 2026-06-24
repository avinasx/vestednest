#!/usr/bin/env bash
# Creates placeholder env var slots on Vercel (all environments).
# Replace REPLACE_ME values in Vercel Dashboard → Settings → Environment Variables.
set -euo pipefail

cd "$(dirname "$0")/.."

PLACEHOLDER="${VERCEL_ENV_PLACEHOLDER:-REPLACE_ME}"
TIMEOUT_SEC="${VERCEL_ENV_TIMEOUT:-60}"

vars=(
  NEXT_PUBLIC_APP_URL
  SUPERADMIN_EMAILS
  GEMINI_API_KEY
  GEMINI_MODEL
  LANGSMITH_API_KEY
  REALIE_API_KEY
  RENTCAST_API_KEY
  SUPERMEMORY_API_KEY
  SENDGRID_API_KEY
  SENDGRID_FROM_EMAIL
  TWILIO_ACCOUNT_SID
  TWILIO_AUTH_TOKEN
  TWILIO_PHONE_NUMBER
  CREDIT_VENDOR_API_KEY
  CREDIT_VENDOR_API_SECRET
  ECC_REFERRAL_EMAIL
  NEXT_PUBLIC_GTM_ID
  NEXT_PUBLIC_META_PIXEL_ID
  META_CONVERSIONS_API_TOKEN
)

add_one() {
  local var="$1"
  local env="$2"
  printf "→ %s / %s ... " "$var" "$env"
  local out
  if out=$(perl -e "alarm shift; exec @ARGV" "$TIMEOUT_SEC" vercel env add "$var" "$env" --value "$PLACEHOLDER" --no-sensitive --yes 2>&1); then
    if echo "$out" | grep -q "Added Environment Variable"; then echo "added"
    elif echo "$out" | grep -q "already exists"; then echo "exists"
    else echo "ok"
    fi
  else
    if echo "$out" | grep -q "already exists"; then echo "exists"
    elif echo "$out" | grep -q "Added Environment Variable"; then echo "added"
    else echo "timeout/fail"
    fi
  fi
}

# Preview requires interactive branch selection in Vercel CLI 54.x — add those in the
# dashboard (Settings → Environment Variables → check "Preview" for each key).
for env in production development; do
  for var in "${vars[@]}"; do
    add_one "$var" "$env"
  done
done

echo ""
echo "=== Current Vercel env vars ==="
vercel env ls

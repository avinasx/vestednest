-- Platform-wide integration settings (DB overrides env at runtime).
-- Business config (rates, funded states) stays in admin_settings.

create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null default 'null'::jsonb,
  is_secret boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.platform_settings enable row level security;

create policy "Superadmins read platform settings"
  on public.platform_settings for select
  using (public.is_superadmin());

create policy "Superadmins manage platform settings"
  on public.platform_settings for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

create trigger platform_settings_updated_at
  before update on public.platform_settings
  for each row execute function public.set_updated_at ();

-- Non-secret defaults (secrets must be set via admin UI or seed from .env)
insert into public.platform_settings (key, value, is_secret)
values
  ('ai.gemini_model', '"gemini-1.5-flash"'::jsonb, false),
  ('email.sendgrid_from', '"quotes@vestednest.com"'::jsonb, false)
on conflict (key) do nothing;

-- Seed full rate_settings defaults when row exists but rate_settings is empty
update public.admin_settings
set rate_settings = '{
  "baseRate": 7.99,
  "originationPts": 1.25,
  "appraisalEst": 650,
  "titleFeeEst": 1840,
  "reserveMonths": 6,
  "ficoBands": [
    {"min": 760, "max": 850, "adjustment": -0.25},
    {"min": 740, "max": 759, "adjustment": -0.125},
    {"min": 700, "max": 739, "adjustment": 0},
    {"min": 680, "max": 699, "adjustment": 0.25},
    {"min": 660, "max": 679, "adjustment": 0.5},
    {"min": 620, "max": 659, "adjustment": 0.75}
  ],
  "borrowerAdjustments": {"llc": 0, "individual": 0.125, "foreign": 0.375},
  "purposeAdjustments": {"purchase": 0, "cashout": 0.25, "bridge": 0.125, "refi": 0.125}
}'::jsonb
where id = 1
  and (rate_settings is null or rate_settings = '{}'::jsonb);

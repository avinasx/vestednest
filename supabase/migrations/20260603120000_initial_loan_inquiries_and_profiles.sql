-- Loan inquiry form + profiles (vestednest)

create type public.loan_strategy as enum (
  'purchase',
  'refi_rate_term',
  'cash_out',
  'bridge_to_dscr'
);

create type public.borrower_type as enum (
  'us_citizen',
  'us_resident',
  'foreign_national'
);

create type public.investment_horizon as enum (
  'long_term',
  'short_term',
  'mid_term'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.loan_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  loan_strategy public.loan_strategy not null,
  street_address text not null,
  city text,
  county text,
  state char(2) not null,
  unit_number text,
  country text not null default 'US',
  down_payment_pct smallint,
  fico_band text not null,
  intended_horizon public.investment_horizon not null,
  borrower_type public.borrower_type not null,
  realie_property jsonb,
  realie_error text,
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index loan_inquiries_user_id_idx on public.loan_inquiries (user_id);
create index loan_inquiries_created_at_idx on public.loan_inquiries (created_at desc);

alter table public.profiles enable row level security;
alter table public.loan_inquiries enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Anyone can submit loan inquiries"
  on public.loan_inquiries for insert
  with check (true);

create policy "Users can view own loan inquiries"
  on public.loan_inquiries for select
  using (auth.uid() = user_id);

create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user ();

create or replace function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger loan_inquiries_updated_at
  before update on public.loan_inquiries
  for each row execute function public.set_updated_at ();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at ();

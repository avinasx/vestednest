-- Production RBAC, applications, knowledge base, loan officers, admin settings

create type public.user_role as enum ('user', 'admin', 'superadmin');

alter table public.profiles
  add column if not exists role public.user_role not null default 'user';

create table public.loan_officers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  title text default 'Loan Officer',
  avatar_initials text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid references auth.users (id) on delete set null,
  address text not null,
  property_intel jsonb,
  term_sheet jsonb,
  fico integer,
  borrower_type text,
  purpose text default 'purchase',
  status text not null default 'draft',
  prequal_consent_at timestamptz,
  prequal_consent_ip text,
  loan_officer_id uuid references public.loan_officers (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_session_id_idx on public.applications (session_id);
create index applications_user_id_idx on public.applications (user_id);
create index applications_status_idx on public.applications (status);

create table public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null check (source_type in ('markdown', 'pdf', 'url')),
  content text,
  file_path text,
  source_url text,
  supermemory_id text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index knowledge_documents_created_at_idx on public.knowledge_documents (created_at desc);

create table public.admin_settings (
  id int primary key default 1 check (id = 1),
  rate_settings jsonb not null default '{}'::jsonb,
  funded_states text[] not null default array[
    'AL','AZ','AR','CA','CO','CT','DE','FL','GA','ID','IL','IN','IA','KS','KY',
    'LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
    'NC','OH','OK','OR','PA','SC','TN','TX','UT','VA','WA','WI','WY'
  ],
  feature_flags jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

insert into public.admin_settings (id) values (1) on conflict (id) do nothing;

-- RBAC helpers
create or replace function public.is_superadmin ()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'superadmin'
  );
$$;

create or replace function public.is_admin_or_superadmin ()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'superadmin')
  );
$$;

-- Enable RLS
alter table public.loan_officers enable row level security;
alter table public.applications enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.admin_settings enable row level security;

-- Profiles: superadmins can read all; owners read/update own; superadmins can update roles
drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles viewable by owner or superadmin"
  on public.profiles for select
  using (auth.uid() = id or public.is_superadmin());

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Superadmins can update any profile"
  on public.profiles for update
  using (public.is_superadmin());

-- Applications: users see own; superadmins see all
create policy "Users view own applications"
  on public.applications for select
  using (auth.uid() = user_id or public.is_superadmin());

create policy "Users insert own applications"
  on public.applications for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Users update own applications"
  on public.applications for update
  using (auth.uid() = user_id or public.is_superadmin());

create policy "Superadmins manage all applications"
  on public.applications for all
  using (public.is_superadmin());

-- Knowledge documents: superadmin only
create policy "Superadmins manage knowledge documents"
  on public.knowledge_documents for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- Loan officers: public read active; superadmin write
create policy "Anyone can view active loan officers"
  on public.loan_officers for select
  using (active = true or public.is_superadmin());

create policy "Superadmins manage loan officers"
  on public.loan_officers for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- Admin settings: superadmin write; authenticated read for funded states
create policy "Authenticated users read admin settings"
  on public.admin_settings for select
  using (auth.uid() is not null or public.is_superadmin());

create policy "Superadmins manage admin settings"
  on public.admin_settings for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- Loan inquiries: allow service role inserts; users view own
create policy "Superadmins view all loan inquiries"
  on public.loan_inquiries for select
  using (public.is_superadmin());

-- Triggers
create trigger loan_officers_updated_at
  before update on public.loan_officers
  for each row execute function public.set_updated_at ();

create trigger applications_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at ();

create trigger knowledge_documents_updated_at
  before update on public.knowledge_documents
  for each row execute function public.set_updated_at ();

create trigger admin_settings_updated_at
  before update on public.admin_settings
  for each row execute function public.set_updated_at ();

-- Storage bucket for knowledge PDFs
insert into storage.buckets (id, name, public)
  values ('knowledge-docs', 'knowledge-docs', false)
  on conflict (id) do nothing;

create policy "Superadmins upload knowledge docs"
  on storage.objects for insert
  with check (bucket_id = 'knowledge-docs' and public.is_superadmin());

create policy "Superadmins read knowledge docs"
  on storage.objects for select
  using (bucket_id = 'knowledge-docs' and public.is_superadmin());

create policy "Superadmins delete knowledge docs"
  on storage.objects for delete
  using (bucket_id = 'knowledge-docs' and public.is_superadmin());

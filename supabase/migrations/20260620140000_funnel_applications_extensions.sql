-- Quote funnel: deal snapshot, contact, attribution, documents

alter table public.applications
  add column if not exists deal_snapshot jsonb,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists utm jsonb,
  add column if not exists referral_partner text,
  add column if not exists soft_pull_vendor_ref text,
  add column if not exists soft_pull_at timestamptz;

create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  doc_type text not null,
  file_path text not null,
  file_name text not null,
  content_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists application_documents_application_id_idx
  on public.application_documents (application_id);

alter table public.application_documents enable row level security;

create policy "Users view own application documents"
  on public.application_documents for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
    or public.is_superadmin()
  );

create policy "Users insert own application documents"
  on public.application_documents for insert
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );

insert into storage.buckets (id, name, public)
  values ('borrower-documents', 'borrower-documents', false)
  on conflict (id) do nothing;

create policy "Users upload borrower docs"
  on storage.objects for insert
  with check (
    bucket_id = 'borrower-documents'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users read own borrower docs"
  on storage.objects for select
  using (
    bucket_id = 'borrower-documents'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

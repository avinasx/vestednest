-- Logic documents for underwriting engine (guidelines, matrices, rate sheets)

create table public.logic_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null check (
    source_type in (
      'guidelines',
      'program_matrix',
      'state_licensing',
      'rate_sheet',
      'prepay_licensing'
    )
  ),
  file_path text,
  parsed_rules jsonb,
  sanitized_content text,
  version text not null default '1.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index logic_documents_source_type_idx on public.logic_documents (source_type);
create index logic_documents_updated_at_idx on public.logic_documents (updated_at desc);

alter table public.admin_settings
  add column if not exists state_eligibility jsonb not null default '[]'::jsonb;

alter table public.knowledge_documents
  drop constraint if exists knowledge_documents_source_type_check;

alter table public.knowledge_documents
  add constraint knowledge_documents_source_type_check
  check (source_type in ('markdown', 'pdf', 'url', 'docx'));

alter table public.logic_documents enable row level security;

create policy "Superadmins manage logic documents"
  on public.logic_documents for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

create trigger logic_documents_updated_at
  before update on public.logic_documents
  for each row execute function public.set_updated_at ();

insert into storage.buckets (id, name, public)
  values ('logic-docs', 'logic-docs', false)
  on conflict (id) do nothing;

create policy "Superadmins upload logic docs"
  on storage.objects for insert
  with check (bucket_id = 'logic-docs' and public.is_superadmin());

create policy "Superadmins read logic docs"
  on storage.objects for select
  using (bucket_id = 'logic-docs' and public.is_superadmin());

create policy "Superadmins delete logic docs"
  on storage.objects for delete
  using (bucket_id = 'logic-docs' and public.is_superadmin());

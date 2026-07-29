-- LinguaVerse AI / Học Hành Lắm — Document Center Migration
-- Includes: documents, document_quizzes, RLS, indexes, realtime.

-- 1. Documents Table
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  title text not null,
  file_type text not null check (file_type in ('pdf', 'docx', 'ppt', 'txt', 'image', 'screenshot', 'book')),
  file_url text,
  file_size text not null default '0 KB',
  extracted_text text not null default '',
  language text not null default 'en' check (language in ('en', 'ko', 'zh', 'vi')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Document Quizzes Table
create table if not exists public.document_quizzes (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents (id) on delete cascade,
  title text not null,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS (Open for personal app mode)
alter table public.documents enable row level security;
alter table public.document_quizzes enable row level security;

create policy "Allow all on documents" on public.documents for all using (true) with check (true);
create policy "Allow all on document_quizzes" on public.document_quizzes for all using (true) with check (true);

-- Indexes
create index if not exists idx_documents_file_type on public.documents(file_type);
create index if not exists idx_documents_created_at on public.documents(created_at desc);
create index if not exists idx_document_quizzes_document_id on public.document_quizzes(document_id);

-- Realtime publication
alter publication supabase_realtime add table public.documents;
alter publication supabase_realtime add table public.document_quizzes;

-- Trigger updated_at
drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at before update on public.documents for each row execute procedure public.set_updated_at();

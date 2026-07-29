-- Học Hành Lắm 🍃 — Semantic Search & Knowledge Graph Migration
-- Includes: search_history, semantic_embeddings, RLS, indexes, realtime.

-- 1. Search History Table
create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  query text not null,
  domain_filter text not null default 'all',
  created_at timestamptz not null default now()
);

-- 2. Semantic Embeddings Table
create table if not exists public.semantic_embeddings (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('vocabulary', 'grammar', 'conversation', 'documents', 'flashcards', 'quizzes', 'collections', 'knowledge_graph', 'recommendation')),
  item_id text not null,
  content_text text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS (Open for personal app mode)
alter table public.search_history enable row level security;
alter table public.semantic_embeddings enable row level security;

create policy "Allow all on search_history" on public.search_history for all using (true) with check (true);
create policy "Allow all on semantic_embeddings" on public.semantic_embeddings for all using (true) with check (true);

-- Indexes
create index if not exists idx_search_history_created_at on public.search_history(created_at desc);
create index if not exists idx_semantic_embeddings_item_type on public.semantic_embeddings(item_type);

-- Realtime publication
alter publication supabase_realtime add table public.search_history;
alter publication supabase_realtime add table public.semantic_embeddings;

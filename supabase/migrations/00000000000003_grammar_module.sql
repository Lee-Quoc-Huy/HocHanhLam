-- LinguaVerse AI — Grammar Module Migration
-- Includes: grammar table, RLS policies (open for personal mode), indexes, realtime publication.

create table if not exists public.grammar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  language text not null check (language in ('en', 'ko', 'zh')),
  title text not null,
  meaning text not null,
  explanation text not null default '',
  examples jsonb not null default '[]'::jsonb,
  common_mistakes jsonb not null default '[]'::jsonb,
  related_grammar text[] not null default '{}',
  difficulty text not null default 'intermediate' check (difficulty in ('beginner', 'intermediate', 'advanced', 'master')),
  is_favorite boolean not null default false,
  category text not null default 'General',
  ai_explanation text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS but allow all operations for personal app
alter table public.grammar enable row level security;

create policy "Allow all operations on grammar for personal app"
  on public.grammar
  for all
  using (true)
  with check (true);

-- Indexes for search & filtering
create index if not exists idx_grammar_language on public.grammar(language);
create index if not exists idx_grammar_category on public.grammar(category);
create index if not exists idx_grammar_is_favorite on public.grammar(is_favorite);
create index if not exists idx_grammar_created_at on public.grammar(created_at desc);

-- Realtime subscription
alter publication supabase_realtime add table public.grammar;

-- Updated_at trigger
drop trigger if exists set_grammar_updated_at on public.grammar;
create trigger set_grammar_updated_at
  before update on public.grammar
  for each row execute procedure public.set_updated_at();

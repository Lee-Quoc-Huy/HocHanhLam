-- LinguaVerse AI — Vocabulary Module Migration
-- Includes: vocabulary table, RLS policies (open for personal mode), indexes, realtime publication.

create table if not exists public.vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  language text not null check (language in ('en', 'ko', 'zh')),
  word text not null,
  ipa text not null default '',
  vietnamese text not null,
  english_meaning text not null default '',
  part_of_speech text not null default 'noun',
  example text not null default '',
  example_translation text not null default '',
  audio_url text not null default '',
  image_url text not null default '',
  synonyms text[] not null default '{}',
  antonyms text[] not null default '{}',
  frequency integer not null default 3 check (frequency >= 1 and frequency <= 5),
  difficulty text not null default 'intermediate' check (difficulty in ('beginner', 'intermediate', 'advanced', 'master')),
  is_favorite boolean not null default false,
  collection text not null default 'General',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS but allow anonymous / single user access for personal app
alter table public.vocabulary enable row level security;

create policy "Allow all operations on vocabulary for personal app"
  on public.vocabulary
  for all
  using (true)
  with check (true);

-- Indexes for performance & search
create index if not exists idx_vocabulary_language on public.vocabulary(language);
create index if not exists idx_vocabulary_collection on public.vocabulary(collection);
create index if not exists idx_vocabulary_is_favorite on public.vocabulary(is_favorite);
create index if not exists idx_vocabulary_created_at on public.vocabulary(created_at desc);

-- Realtime subscription
alter publication supabase_realtime add table public.vocabulary;

-- Updated_at trigger
drop trigger if exists set_vocabulary_updated_at on public.vocabulary;
create trigger set_vocabulary_updated_at
  before update on public.vocabulary
  for each row execute procedure public.set_updated_at();

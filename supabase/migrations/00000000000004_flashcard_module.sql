-- LinguaVerse AI — Flashcard & SRS Module Migration
-- Includes: flashcard_folders, flashcard_collections, flashcards, srs_logs, RLS, indexes, realtime.

-- 1. Folders
create table if not exists public.flashcard_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  description text not null default '',
  color text not null default 'indigo',
  icon text not null default 'Folder',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Collections (Decks)
create table if not exists public.flashcard_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  folder_id uuid references public.flashcard_folders (id) on delete set null,
  name text not null,
  description text not null default '',
  language text not null default 'en' check (language in ('en', 'ko', 'zh', 'all')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Flashcards (SM-2 SRS Metrics)
create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  collection_id uuid references public.flashcard_collections (id) on delete cascade,
  language text not null check (language in ('en', 'ko', 'zh')),
  front_text text not null,
  front_subtext text not null default '',
  back_text text not null,
  back_explanation text not null default '',
  audio_url text not null default '',
  image_url text not null default '',
  game_mode text check (game_mode in ('review', 'quiz', 'spelling', 'reflex', 'blank', 'listening')),
  tags text[] not null default '{}',
  is_favorite boolean not null default false,

  -- SM-2 Spaced Repetition Fields
  repetition integer not null default 0,
  interval integer not null default 0, -- in days
  ease_factor real not null default 2.5, -- EF value
  status text not null default 'new' check (status in ('new', 'learning', 'mastered')),
  due_date timestamptz not null default now(),
  last_reviewed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. SRS Review History Log
create table if not exists public.srs_logs (
  id uuid primary key default gen_random_uuid(),
  flashcard_id uuid references public.flashcards (id) on delete cascade,
  rating text not null check (rating in ('again', 'hard', 'good', 'easy')),
  interval integer not null,
  ease_factor real not null,
  reviewed_at timestamptz not null default now()
);

-- RLS (Open for personal app mode)
alter table public.flashcard_folders enable row level security;
alter table public.flashcard_collections enable row level security;
alter table public.flashcards enable row level security;
alter table public.srs_logs enable row level security;

create policy "Allow all on flashcard_folders" on public.flashcard_folders for all using (true) with check (true);
create policy "Allow all on flashcard_collections" on public.flashcard_collections for all using (true) with check (true);
create policy "Allow all on flashcards" on public.flashcards for all using (true) with check (true);
create policy "Allow all on srs_logs" on public.srs_logs for all using (true) with check (true);

-- Indexes
create index if not exists idx_flashcards_due_date on public.flashcards(due_date);
create index if not exists idx_flashcards_status on public.flashcards(status);
create index if not exists idx_flashcards_collection_id on public.flashcards(collection_id);

-- Realtime publication
alter publication supabase_realtime add table public.flashcard_collections;
alter publication supabase_realtime add table public.flashcards;

-- Triggers for updated_at
drop trigger if exists set_folders_updated_at on public.flashcard_folders;
create trigger set_folders_updated_at before update on public.flashcard_folders for each row execute procedure public.set_updated_at();

drop trigger if exists set_collections_updated_at on public.flashcard_collections;
create trigger set_collections_updated_at before update on public.flashcard_collections for each row execute procedure public.set_updated_at();

drop trigger if exists set_flashcards_updated_at on public.flashcards;
create trigger set_flashcards_updated_at before update on public.flashcards for each row execute procedure public.set_updated_at();

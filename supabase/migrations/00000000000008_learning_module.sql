-- Học Hành Lắm 🍃 — Learning Module Migration
-- Includes: user_gamification, game_scores, challenges, RLS, indexes, realtime.

-- 1. User Gamification Table
create table if not exists public.user_gamification (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade unique,
  total_xp integer not null default 0,
  level integer not null default 1,
  streak_days integer not null default 1,
  games_played integer not null default 0,
  last_active_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Game Scores Table
create table if not exists public.game_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  game_mode text not null check (game_mode in ('quiz', 'listening_quiz', 'grammar_quiz', 'vocabulary_quiz', 'sentence_builder', 'matching_game', 'memory_game', 'typing_game')),
  score integer not null default 0,
  xp_earned integer not null default 0,
  accuracy numeric(5,2) not null default 100.00,
  time_seconds integer not null default 0,
  created_at timestamptz not null default now()
);

-- 3. Challenges Table
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  challenge_type text not null check (challenge_type in ('daily', 'weekly')),
  title text not null,
  description text not null,
  target_count integer not null default 1,
  current_count integer not null default 0,
  reward_xp integer not null default 50,
  is_completed boolean not null default false,
  due_date timestamptz not null,
  created_at timestamptz not null default now()
);

-- RLS (Open for personal app mode)
alter table public.user_gamification enable row level security;
alter table public.game_scores enable row level security;
alter table public.challenges enable row level security;

create policy "Allow all on user_gamification" on public.user_gamification for all using (true) with check (true);
create policy "Allow all on game_scores" on public.game_scores for all using (true) with check (true);
create policy "Allow all on challenges" on public.challenges for all using (true) with check (true);

-- Indexes
create index if not exists idx_user_gamification_total_xp on public.user_gamification(total_xp desc);
create index if not exists idx_game_scores_user_id on public.game_scores(user_id);
create index if not exists idx_challenges_user_type on public.challenges(user_id, challenge_type);

-- Realtime publication
alter publication supabase_realtime add table public.user_gamification;
alter publication supabase_realtime add table public.game_scores;
alter publication supabase_realtime add table public.challenges;

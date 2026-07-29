-- Học Hành Lắm 🍃 — Settings & Analytics Migration
-- Includes: user_settings, user_achievements, user_analytics, RLS, indexes, realtime.

-- 1. User Settings Table
create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade unique,
  full_name text not null default 'Học Viên Học Hành Lắm',
  avatar_url text not null default '',
  bio text not null default 'Hành trình chinh phục đa ngôn ngữ cùng AI.',
  learning_goal_mins integer not null default 30,
  daily_words_target integer not null default 10,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  interface_language text not null default 'vi' check (interface_language in ('vi', 'en', 'ko', 'zh')),
  target_languages text[] not null default '{"en", "ko", "zh"}'::text[],
  api_key text not null default '',
  preferred_ai_model text not null default 'google/gemini-2.5-pro',
  email_notifications boolean not null default true,
  push_reminders boolean not null default true,
  two_factor_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 2. User Achievements Table
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  achievement_key text not null,
  title text not null,
  description text not null,
  icon text not null default 'trophy',
  unlocked_at timestamptz not null default now()
);

-- 3. User Analytics Table
create table if not exists public.user_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  study_date date not null default current_date,
  study_seconds integer not null default 0,
  words_learned integer not null default 0,
  cards_reviewed integer not null default 0,
  ai_messages_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- RLS (Open for personal app mode)
alter table public.user_settings enable row level security;
alter table public.user_achievements enable row level security;
alter table public.user_analytics enable row level security;

create policy "Allow all on user_settings" on public.user_settings for all using (true) with check (true);
create policy "Allow all on user_achievements" on public.user_achievements for all using (true) with check (true);
create policy "Allow all on user_analytics" on public.user_analytics for all using (true) with check (true);

-- Indexes
create index if not exists idx_user_settings_user_id on public.user_settings(user_id);
create index if not exists idx_user_achievements_key on public.user_achievements(achievement_key);
create index if not exists idx_user_analytics_date on public.user_analytics(study_date desc);

-- Realtime publication
alter publication supabase_realtime add table public.user_settings;
alter publication supabase_realtime add table public.user_achievements;
alter publication supabase_realtime add table public.user_analytics;

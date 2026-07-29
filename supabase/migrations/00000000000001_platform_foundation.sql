-- LinguaVerse AI — platform foundation migration
-- Covers: extensions, profiles table, RLS, auth trigger.
-- Learning-domain tables (vocabulary, documents, srs_reviews, study_plans,
-- ai_conversations, etc.) are intentionally NOT included — platform layer
-- only, per project scope.

create extension if not exists "uuid-ossp";
create extension if not exists "vector"; -- pgvector, for future semantic search

-- ---------------------------------------------------------------------
-- profiles: 1:1 extension of auth.users with app-facing fields
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  preferred_theme text not null default 'system' check (preferred_theme in ('light', 'dark', 'system')),
  target_languages text[] not null default array['en', 'ko', 'zh'],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ---------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user is created
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- Keep updated_at fresh
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

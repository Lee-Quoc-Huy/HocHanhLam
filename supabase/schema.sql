-- =========================================================
-- LANG VERSE — SUPABASE (DB CHÍNH: auth + tiến độ người dùng)
-- Chạy file này trong Supabase SQL Editor sau khi tạo project.
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- 1. profiles — hồ sơ người dùng, 1-1 với auth.users
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,                              -- tên đăng nhập hiển thị (đăng nhập bằng email giả quy đổi từ tên này, xem lib/auth/username.ts)
  display_name text not null default 'Học viên',
  selected_languages text[] not null default '{}',   -- vd: {en,kr}
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tự tạo profile trống khi có user mới đăng ký
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- 2. user_progress — tiến độ theo từng ngôn ngữ đã chọn
-- ---------------------------------------------------------
create table if not exists public.user_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lang_code text not null check (lang_code in ('en','kr','cn','jp')),
  level int not null default 0,          -- chỉ số cấp độ (0..4), map sang tên cấp ở DB nội dung (Neon)
  xp int not null default 0 check (xp >= 0 and xp <= 100),
  streak int not null default 0,
  last_active_date date,
  updated_at timestamptz not null default now(),
  unique (user_id, lang_code)
);

-- ---------------------------------------------------------
-- 3. user_vocab — từ vựng cá nhân người dùng tự lưu
-- ---------------------------------------------------------
create table if not exists public.user_vocab (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lang_code text not null check (lang_code in ('en','kr','cn','jp')),
  term text not null,
  pronunciation text,
  meaning text not null,
  tag text,
  source text not null default 'manual' check (source in ('manual','sheet','photo')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 4. user_grammar — ngữ pháp cá nhân người dùng tự lưu
-- ---------------------------------------------------------
create table if not exists public.user_grammar (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lang_code text not null check (lang_code in ('en','kr','cn','jp')),
  title text not null,
  explanation text not null,
  tag text,
  source text not null default 'manual' check (source in ('manual','sheet','photo')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 5. quiz_attempts — lịch sử làm bài (Hoàn thành câu / Đọc hiểu / Flashcard)
--    dùng để AI tính lộ trình cá nhân hoá
-- ---------------------------------------------------------
create table if not exists public.quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lang_code text not null check (lang_code in ('en','kr','cn','jp')),
  game_type text not null check (game_type in ('flashcard','fillblank','reading')),
  total_questions int not null,
  correct_answers int not null,
  xp_earned int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 6. chat_messages — lịch sử trò chuyện với Giảng viên AI
-- ---------------------------------------------------------
create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user','ai')),
  content text not null,
  mode text check (mode in ('short','explain','web')),
  created_at timestamptz not null default now()
);

create index if not exists idx_progress_user on public.user_progress(user_id);
create index if not exists idx_vocab_user_lang on public.user_vocab(user_id, lang_code);
create index if not exists idx_grammar_user_lang on public.user_grammar(user_id, lang_code);
create index if not exists idx_quiz_user on public.quiz_attempts(user_id);
create index if not exists idx_chat_user on public.chat_messages(user_id, created_at);

-- =========================================================
-- ROW LEVEL SECURITY — mỗi người dùng chỉ thấy & sửa dữ liệu của chính mình
-- =========================================================
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_vocab enable row level security;
alter table public.user_grammar enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.chat_messages enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "progress_select_own" on public.user_progress for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.user_progress for update using (auth.uid() = user_id);

create policy "vocab_select_own" on public.user_vocab for select using (auth.uid() = user_id);
create policy "vocab_insert_own" on public.user_vocab for insert with check (auth.uid() = user_id);
create policy "vocab_update_own" on public.user_vocab for update using (auth.uid() = user_id);
create policy "vocab_delete_own" on public.user_vocab for delete using (auth.uid() = user_id);

create policy "grammar_select_own" on public.user_grammar for select using (auth.uid() = user_id);
create policy "grammar_insert_own" on public.user_grammar for insert with check (auth.uid() = user_id);
create policy "grammar_update_own" on public.user_grammar for update using (auth.uid() = user_id);
create policy "grammar_delete_own" on public.user_grammar for delete using (auth.uid() = user_id);

create policy "quiz_select_own" on public.quiz_attempts for select using (auth.uid() = user_id);
create policy "quiz_insert_own" on public.quiz_attempts for insert with check (auth.uid() = user_id);

create policy "chat_select_own" on public.chat_messages for select using (auth.uid() = user_id);
create policy "chat_insert_own" on public.chat_messages for insert with check (auth.uid() = user_id);

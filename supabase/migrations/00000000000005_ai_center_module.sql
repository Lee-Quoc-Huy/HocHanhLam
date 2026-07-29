-- LinguaVerse AI — AI Center & Agent History Migration
-- Includes: ai_conversations, ai_messages, RLS, indexes, realtime.

-- 1. Conversations Table
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  title text not null,
  agent_type text not null check (agent_type in ('vocabulary', 'grammar', 'teacher', 'conversation', 'planner', 'search', 'translation', 'recommendation')),
  target_language text not null default 'en' check (target_language in ('en', 'ko', 'zh')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Messages Table
create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.ai_conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS (Open for personal app mode)
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

create policy "Allow all on ai_conversations" on public.ai_conversations for all using (true) with check (true);
create policy "Allow all on ai_messages" on public.ai_messages for all using (true) with check (true);

-- Indexes
create index if not exists idx_ai_conversations_agent_type on public.ai_conversations(agent_type);
create index if not exists idx_ai_conversations_created_at on public.ai_conversations(created_at desc);
create index if not exists idx_ai_messages_conversation_id on public.ai_messages(conversation_id);

-- Realtime publication
alter publication supabase_realtime add table public.ai_conversations;
alter publication supabase_realtime add table public.ai_messages;

-- Updated_at trigger
drop trigger if exists set_conversations_updated_at on public.ai_conversations;
create trigger set_conversations_updated_at before update on public.ai_conversations for each row execute procedure public.set_updated_at();

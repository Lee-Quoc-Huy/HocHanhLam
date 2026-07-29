-- Học Hành Lắm 🍃 — Library Module Migration
-- Includes: library_folders, library_collections, library_items, library_item_versions, RLS, indexes, realtime.

-- 1. Library Folders Table
create table if not exists public.library_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  parent_id uuid references public.library_folders (id) on delete cascade,
  name text not null,
  color text not null default '#10b981',
  icon text not null default 'folder',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Library Collections Table
create table if not exists public.library_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  folder_id uuid references public.library_folders (id) on delete cascade,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Library Items Table
create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  folder_id uuid references public.library_folders (id) on delete set null,
  collection_id uuid references public.library_collections (id) on delete set null,
  title text not null,
  item_type text not null check (item_type in ('document', 'audio', 'video', 'image', 'note')),
  file_url text,
  file_size text not null default '0 KB',
  content_text text not null default '',
  tags text[] not null default '{}'::text[],
  is_favorite boolean not null default false,
  is_trashed boolean not null default false,
  share_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Library Item Versions Table
create table if not exists public.library_item_versions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.library_items (id) on delete cascade,
  version_number integer not null default 1,
  title text not null,
  content_text text not null,
  created_at timestamptz not null default now()
);

-- RLS (Open for personal app mode)
alter table public.library_folders enable row level security;
alter table public.library_collections enable row level security;
alter table public.library_items enable row level security;
alter table public.library_item_versions enable row level security;

create policy "Allow all on library_folders" on public.library_folders for all using (true) with check (true);
create policy "Allow all on library_collections" on public.library_collections for all using (true) with check (true);
create policy "Allow all on library_items" on public.library_items for all using (true) with check (true);
create policy "Allow all on library_item_versions" on public.library_item_versions for all using (true) with check (true);

-- Indexes
create index if not exists idx_library_items_user_id on public.library_items(user_id);
create index if not exists idx_library_items_item_type on public.library_items(item_type);
create index if not exists idx_library_items_is_trashed on public.library_items(is_trashed);
create index if not exists idx_library_item_versions_item_id on public.library_item_versions(item_id);

-- Realtime publication
alter publication supabase_realtime add table public.library_folders;
alter publication supabase_realtime add table public.library_collections;
alter publication supabase_realtime add table public.library_items;
alter publication supabase_realtime add table public.library_item_versions;

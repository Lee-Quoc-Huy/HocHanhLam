-- =========================================================
-- MIGRATION: thêm cột username cho các project Supabase đã chạy
-- schema.sql gốc trước đó (không có username). Chạy an toàn, không mất
-- dữ liệu cũ. Dán vào Supabase SQL Editor và Run.
-- =========================================================

alter table public.profiles add column if not exists username text unique;

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

-- =========================================================
-- MIGRATION: cấp quyền (GRANT) cho vai trò "authenticated" trên các bảng
-- DB CHÍNH. Chạy nếu bạn gặp lỗi "permission denied for table ..." dù đã
-- đăng nhập đúng và RLS đã đúng — đây là lỗi CẤP QUYỀN, khác với RLS.
--
-- Giải thích: RLS quyết định "được thấy DÒNG nào", còn GRANT quyết định
-- "có được ĐỤNG VÀO BẢNG đó hay không" ngay từ đầu — thiếu GRANT thì dù
-- RLS đúng 100% vẫn bị chặn với lỗi "permission denied".
--
-- Dán vào Supabase SQL Editor và Run. An toàn, không đụng tới dữ liệu.
-- =========================================================

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_progress to authenticated;
grant select, insert, update, delete on public.user_vocab to authenticated;
grant select, insert, update, delete on public.user_grammar to authenticated;
grant select, insert, update, delete on public.quiz_attempts to authenticated;
grant select, insert, update, delete on public.chat_messages to authenticated;

-- Đảm bảo mọi bảng tạo SAU này trong schema public cũng tự động được cấp
-- quyền tương tự, không phải nhớ chạy GRANT thủ công mỗi lần thêm bảng mới.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

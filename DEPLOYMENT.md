# 🚀 Hướng Dẫn Triển Khai & Deploy — Học Hành Lắm 🍃

Tài liệu này chi tiết các bước triển khai dự án **Học Hành Lắm** lên nền tảng **Vercel** kết hợp **Supabase PostgreSQL Database** và **OpenRouter AI Gateway**.

---

## 1. Chuẩn Bị Cơ Sở Dữ Liệu Supabase

1. Truy cập [Supabase Console](https://supabase.com) và tạo một Project mới.
2. Vào mục **SQL Editor** trong Supabase Dashboard.
3. Chạy lần lượt các tệp Migration SQL trong thư mục `supabase/migrations/`:
   - `00000000000001_initial_schema.sql`
   - `00000000000002_vocabulary_table.sql`
   - `00000000000003_grammar_table.sql`
   - `00000000000004_flashcards_table.sql`
   - `00000000000005_ai_conversations.sql`
   - `00000000000006_document_center.sql`
   - `00000000000007_semantic_search.sql`
   - `00000000000008_learning_module.sql`
   - `00000000000009_library_module.sql`
   - `00000000000010_settings_and_analytics.sql`

4. Lấy các thông số kết nối tại **Project Settings -> API**:
   - `URL` (Project URL)
   - `anon / public` API Key

---

## 2. Triển Khai Lên Vercel

1. Đẩy mã nguồn dự án lên repository GitHub / GitLab.
2. Truy cập [Vercel Dashboard](https://vercel.com) và chọn **Add New Project**.
3. Import Repository dự án `linguaverse-ai`.
4. Cấu hình **Environment Variables** trên Vercel:
   | Tên Biến | Giá Trị |
   | :--- | :--- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJKV1Qi...` |
   | `OPENROUTER_API_KEY` | `sk-or-v1-xxxx...` |

5. Bấm **Deploy**. Vercel sẽ tự động build và xuất bản trang web.

---

## 3. Kiểm Tra Sau Khi Deploy

- Kiểm tra truy cập đường dẫn miền Vercel (ví dụ: `https://hochanhlam.vercel.app`).
- Thử nghiệm các tính năng cốt lõi:
  - Tra cứu từ vựng & nghe phát âm TTS.
  - Hội thoại trực tiếp với Trợ lý AI.
  - Tải tài liệu PDF và trích xuất OCR.
  - Luyện tập 8 chế độ Game.
  - Xuất / Nhập bản sao lưu dữ liệu JSON trong mục Cài Đặt.

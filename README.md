# Học Hành Lắm — Học ngôn ngữ cùng AI

Ứng dụng Next.js 14 (App Router, TypeScript, Tailwind) triển khai theo đúng ý tưởng ban đầu:
web học Anh/Hàn/Trung/Nhật, cá nhân hoá bằng AI, có onboarding chọn ngôn ngữ, kiến trúc **2 database**.

## Kiến trúc dữ liệu (theo yêu cầu mới nhất)

| Vai trò | Nơi lưu | Bảng |
|---|---|---|
| **DB chính — tiến độ & dữ liệu người dùng** | Supabase (Postgres + Auth) | `profiles`, `user_progress`, `user_vocab`, `user_grammar`, `quiz_attempts`, `chat_messages` |
| **DB phụ — nội dung tĩnh dùng chung** | Neon (Postgres) | `languages`, `topics`, `fillblank_questions`, `reading_passages`, `dictionary_seed` |
| **Lưu trữ tài liệu** | Cloudflare (R2) | biến môi trường đã có sẵn trong `.env.example`, chưa nối tính năng lưu file gốc — xem mục "Việc còn lại" |

Lý do gộp `user_vocab`/`user_grammar` vào DB chính: đây là dữ liệu **gắn với hành trình học của từng người**
(giống tiến độ), nên đặt cùng Supabase để 1 lần đọc RLS là đủ, tránh phải join xuyên 2 DB mỗi khi hiển thị dashboard.
Neon chỉ giữ nội dung admin nạp sẵn, giống nhau cho mọi người dùng.

## Auth & Onboarding

- Đăng ký/đăng nhập bằng **tên đăng nhập + mật khẩu** (không dùng email thật, không xác nhận mail).
- Supabase Auth về bản chất chỉ hỗ trợ email/mật khẩu, nên tên đăng nhập được quy đổi thành 1 email "giả"
  duy nhất (`<username>@users.hochanhlam.local`, xem `lib/auth/username.ts`) — người dùng không hề thấy
  khái niệm email này. Tên đăng nhập thật lưu ở cột `profiles.username`.
- **Đăng ký đi qua API server** (`app/api/auth/register/route.ts`) dùng **Supabase Admin API**
  (`auth.admin.createUser({ email_confirm: true })`) thay vì `supabase.auth.signUp()` phía client. Cách này
  tạo tài khoản ở trạng thái "đã xác nhận" ngay lập tức và **không gửi bất kỳ email nào cả** — tránh hẳn lỗi
  `email rate limit exceeded` hay gặp khi test nhiều tài khoản liên tiếp, và không phụ thuộc vào việc bật/tắt
  "Confirm email" trong Supabase Dashboard nữa.
- Cần thêm biến `SUPABASE_SERVICE_ROLE_KEY` (lấy tại Project Settings → API → mục "service_role") —
  đây là key có toàn quyền trên DB, **chỉ đặt trên server** (Vercel Environment Variables), không bao giờ
  thêm tiền tố `NEXT_PUBLIC_` vào biến này.
- Vì không có email thật, tính năng "Quên mật khẩu" không hoạt động qua email — với quy mô 2-4 người test,
  cách đơn giản nhất là admin (bạn) vào Supabase Dashboard → Authentication → Users → chọn user → "Reset
  password" thủ công khi cần.
- Nếu project Supabase đã chạy `schema.sql` cũ (chưa có cột `username`), chạy thêm
  `supabase/migration_add_username.sql` trong SQL Editor để bổ sung, không mất dữ liệu cũ.
- Middleware (`middleware.ts`) tự refresh session, chặn truy cập khi chưa đăng nhập, và **bắt buộc onboarding**
  (`profiles.onboarded = false`) trước khi vào bất kỳ trang nào khác.
- Trang `/onboarding`: người dùng chọn 1+ ngôn ngữ muốn học → lưu vào `profiles.selected_languages` +
  tạo sẵn dòng `user_progress` (level/xp/streak = 0) cho từng ngôn ngữ đã chọn.
- Toàn bộ Dashboard, Từ vựng, Ngữ pháp, Ôn tập chỉ hiển thị/lọc theo đúng các ngôn ngữ đã chọn — đây chính
  là cách AI/hệ thống "theo dõi người dùng" dựa trên lựa chọn ban đầu.

## AI theo tầng miễn phí (`lib/ai/router.ts`)

Mỗi loại tác vụ có 1 provider chính + tối đa 2 lớp dự phòng, tự động rơi xuống khi provider chính lỗi/hết quota:

| Tác vụ | Chuỗi provider |
|---|---|
| Giải thích chi tiết | Gemini 2.5 Flash → Groq Llama-4-Scout → OpenRouter Llama-3.1 (free) |
| Trả lời nhanh | Groq Llama-3.1-8B-Instant → Gemini Flash → OpenRouter Gemma-2 (free) |
| Phân tích ngữ pháp khó | Gemini 2.5 Pro → Gemini Flash → OpenRouter Llama-3.1 (free) |
| Tạo bài luyện tập | Gemini Flash → Groq Scout → OpenRouter Llama-3.1 (free) |
| Dịch thuật | Groq Qwen → Gemini Flash-Lite → OpenRouter Qwen-2.5 (free) |
| Đọc ảnh/phân loại nhanh | Gemini Flash-Lite → Groq Instant → OpenRouter Gemma-2 (free) |

Nếu **không cấu hình API key nào**, mọi tính năng AI vẫn hoạt động — trả về thông báo hướng dẫn thay vì lỗi trắng trang.

⚠️ **Lưu ý**: tên các model free trên OpenRouter/Groq/Gemini đổi theo thời gian — kiểm tra lại danh sách mới
nhất trước khi deploy thật (link tương ứng nằm ngay trong từng file ở `lib/ai/providers/`). Khác với Ollama,
cả 3 provider hiện tại (Gemini, Groq, OpenRouter) đều là dịch vụ cloud nên chạy bình thường trên Vercel —
không cần tự host server riêng nữa.

## Cấu trúc thư mục chính

```
app/
  login/, register/, onboarding/        — auth & chọn ngôn ngữ
  (main)/layout.tsx                     — shell (sidebar/bottom nav), bắt buộc đăng nhập + đã onboarding
  (main)/dashboard/                     — orbit tiến độ theo ngôn ngữ đã chọn
  (main)/vocab/, grammar/               — CRUD từ vựng/ngữ pháp cá nhân (Supabase)
  (main)/translate/                     — dịch (Neon dictionary → AI fallback)
  (main)/games/                         — Flashcard (Supabase) + Hoàn thành câu/Đọc hiểu (Neon)
  (main)/tutor/                         — chat với Giảng viên AI, lưu lịch sử vào Supabase
  api/ai/tutor, api/ai/translate        — route gọi AI router phía server (key không lộ ra client)
  api/vocab/import-photo                — AI đọc ảnh (Gemini Vision)
  api/progress/complete                 — tính XP/level/streak sau mỗi trò chơi
lib/
  supabase/{client,server}.ts           — DB CHÍNH
  neon/db.ts                            — DB PHỤ
  ai/router.ts + providers/             — điều phối AI đa tầng
supabase/schema.sql                     — chạy trong Supabase SQL Editor (có RLS)
neon/schema.sql                         — chạy trong Neon SQL Editor (có seed data mẫu)
```

## Bảo mật đã áp dụng

- **Row Level Security** trên mọi bảng Supabase — mỗi người chỉ đọc/ghi được dữ liệu của chính mình
  (`auth.uid() = user_id`), kể cả khi API route có bug thì DB vẫn chặn ở tầng dưới cùng.
- Mọi input từ client đều validate lại bằng `zod` ở server (Server Actions & Route Handlers), không tin
  riêng validate phía client.
- API key AI (`GOOGLE_AI_STUDIO_API_KEY`, `GROQ_API_KEY`) chỉ tồn tại ở biến môi trường server, **không** có
  tiền tố `NEXT_PUBLIC_`, nên không bao giờ lộ ra bundle client.
- Middleware chặn truy cập route bảo vệ trước khi trang render, không chỉ ẩn UI bằng JS.
- Câu lệnh SQL ở `lib/neon/db.ts` dùng tagged template (tự động parameterize) — không nối chuỗi SQL thô.

## Cài đặt & deploy (GitHub + Vercel)

1. **Tạo project Supabase** → vào SQL Editor, chạy `supabase/schema.sql`.
   - Vào **Project Settings → API**, lấy thêm key **service_role** (bên cạnh `anon`) cho biến
     `SUPABASE_SERVICE_ROLE_KEY` — bắt buộc để tính năng đăng ký hoạt động (xem mục Auth & Onboarding ở trên).
   - Nếu project đã tạo từ trước và đã chạy schema cũ, chạy thêm `supabase/migration_add_username.sql`.
2. **Tạo project Neon** → chạy `neon/schema.sql` (đã kèm sẵn seed data mẫu để test được ngay).
3. **Lấy API key miễn phí**: [Google AI Studio](https://aistudio.google.com/apikey),
   [Groq Console](https://console.groq.com/keys), [OpenRouter](https://openrouter.ai/keys).
4. Copy `.env.example` → `.env.local`, điền đủ các biến.
5. Chạy thử local:
   ```bash
   npm install
   npm run dev
   ```
6. Đẩy code lên GitHub, import repo vào Vercel, dán toàn bộ biến môi trường ở bước 4 vào
   Vercel Project Settings → Environment Variables, rồi Deploy.

## Việc còn lại (chưa nằm trong bản này, do cần key/tài khoản thật để test)

- **Cloudflare R2**: hiện tính năng "Tải file Sheet" nhận nội dung CSV dán trực tiếp (không cần R2) và
  "Chụp ảnh" gửi thẳng ảnh cho Gemini Vision (không lưu ảnh gốc). Nếu bạn muốn giữ lại file gốc để tra cứu
  sau này, cần thêm 1 route tạo **presigned upload URL** tới R2 bằng AWS SDK v3 (R2 tương thích S3 API) —
  biến môi trường đã có sẵn trong `.env.example`, chỉ cần viết thêm ~30 dòng code khi bạn có bucket thật.
- **10 model AI** trong ý tưởng gốc đã được rút gọn hợp lý còn 6 tác vụ với tối đa 3 lớp dự phòng — đủ phủ
  toàn bộ tính năng, dễ bảo trì hơn cho 2-4 người test. Muốn thêm lại đủ 10 model thì chỉnh trực tiếp trong
  `lib/ai/router.ts`.
- **"3 Flash"** trong bảng gốc là tên model chưa xác nhận tại thời điểm viết code — tạm map vào Gemini 2.5
  Flash cho tác vụ tạo bài luyện tập, cập nhật lại trong `.env` khi Google phát hành model đó.

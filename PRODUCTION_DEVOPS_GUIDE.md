# 🛠️ Hướng Dẫn DevOps Triển Khai Production — Học Hành Lắm 🍃

Tài liệu hướng dẫn vận hành chi tiết từ Senior DevOps Engineer dành cho hệ thống **Học Hành Lắm** 🍃 trên hạ tầng **Vercel**, **Supabase (PostgreSQL & Storage)**, **OpenRouter AI Gateway** và **GitHub Actions CI/CD**.

---

## 1. Cấu Trúc Thư Mục Production (Production Directory Architecture)

```
linguaverse-ai/
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Continuous Integration (Typecheck & Build)
│       └── cd.yml                     # Continuous Deployment (Vercel Prod Release)
├── e2e/
│   └── app.spec.ts                    # Playwright End-to-End Tests
├── public/
│   ├── icons/                         # PWA Icons (192x192, 512x512)
│   ├── manifest.json                  # PWA Web App Manifest
│   ├── robots.txt                     # Crawler Indexing Directives
│   └── sw.js                          # Service Worker Cache Engine
├── src/
│   ├── app/                           # Next.js 15 App Router Routes
│   │   ├── (dashboard)/               # Core Application Pages
│   │   │   ├── ai-tutor/              # 8 AI Agents SSE Streaming
│   │   │   ├── dashboard/             # Main Learning Hub
│   │   │   ├── documents/             # OCR & PDF Processing
│   │   │   ├── flashcards/            # SM-2 SRS Engine
│   │   │   ├── grammar/               # Grammar Knowledge Base
│   │   │   ├── learning/              # 8 Gamified Games
│   │   │   ├── library/               # Multi-Media Asset Manager
│   │   │   ├── settings/              # System Control Center
│   │   │   └── vocabulary/            # Vocabulary Hub & TTS
│   │   ├── api/                       # API Route Handlers
│   │   ├── error.tsx                  # Segment Error Boundary
│   │   ├── global-error.tsx           # Global Root Error Boundary
│   │   ├── layout.tsx                 # Root Layout & Metadata
│   │   └── sitemap.ts                 # Dynamic Sitemap Generator
│   ├── components/                    # UI Components & Skeletons
│   ├── features/                      # Modular Business Domain Features
│   ├── lib/                           # Supabase Client & Shared Libraries
│   └── types/                         # TypeScript Types & DB Interfaces
├── supabase/
│   └── migrations/                    # 10 Executable SQL Migrations
├── .env.example                       # Production Env Template
├── .env.local.example                 # Local Dev Env Template
├── DEPLOYMENT.md                      # Quick Deployment Steps
├── LICENSE                            # MIT License
├── middleware.ts                      # Supabase Auth Session Middleware
├── next.config.mjs                    # Next.js PWA & Image Configurations
├── package.json                       # Project Dependencies & Scripts
├── README.md                          # Technical Documentation
└── vercel.json                        # Vercel Production Headers & Routing
```

---

## 2. Hướng Dẫn Tạo Project Trên Supabase

1. Truy cập [Supabase Console](https://supabase.com) và đăng nhập bằng tài khoản GitHub.
2. Bấm **New Project**, đặt tên dự án: `hochanhlam-production`.
3. Chọn khu vực Server gần người dùng Việt Nam nhất: **Singapore (ap-southeast-1)**.
4. Đặt Mật khẩu cho Database (`Database Password`) và lưu trữ an toàn trong mật khẩu quản trị.
5. Truy cập mục **SQL Editor** trong Supabase Dashboard, tạo một Query mới và dán toàn bộ mã nguồn của 10 tệp migration SQL theo thứ tự từ `00000000000001` đến `00000000000010` từ thư mục `supabase/migrations/`.
6. Bấm **Run** để khởi tạo các bảng, RLS Policies, Indexes và Realtime publication.

---

## 3. Hướng Dẫn Tạo Project Trên Vercel

1. Đăng nhập [Vercel Dashboard](https://vercel.com).
2. Bấm nút **Add New...** -> **Project**.
3. Kết nối với tài khoản GitHub và chọn Repository `hochanhlam` (hoặc `linguaverse-ai`).
4. Tại phần **Framework Preset**, Vercel sẽ tự động phát hiện **Next.js**.
5. Nhập các **Environment Variables** (Xem chi tiết tại Mục 5).
6. Bấm **Deploy**.

---

## 4. Hướng Dẫn Kết Nối GitHub & Cấu Hình Secrets

Để GitHub Actions tự động kiểm thử (CI) và tự động deploy (CD) khi merge code vào nhánh `main`:

1. Vào repository trên GitHub -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Thêm các Secret sau:
   - `VERCEL_TOKEN`: Tạo tại Vercel Account Settings -> Tokens.
   - `NEXT_PUBLIC_SUPABASE_URL`: Đường dẫn URL dự án Supabase.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon Key của Supabase.
   - `OPENROUTER_API_KEY`: API Key kết nối OpenRouter.

---

## 5. Hướng Dẫn Thêm Environment Variables

Thêm các biến môi trường tại **Vercel Project Settings -> Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJKV1QiLCJhbGci...
OPENROUTER_API_KEY=sk-or-v1-xxxx...
NEXT_PUBLIC_SITE_URL=https://hochanhlam.vercel.app
```

---

## 6. Hướng Dẫn Deploy Từng Bước (Step-by-Step Deployment)

1. **Bước 1**: Kiểm tra mã nguồn dưới máy cục bộ:
   ```bash
   npm run typecheck
   npm run build
   ```
2. **Bước 2**: Push mã nguồn lên nhánh `main`:
   ```bash
   git add .
   git commit -m "feat: release production v1.0.0"
   git push origin main
   ```
3. **Bước 3**: GitHub Actions `ci.yml` và `cd.yml` sẽ tự động chạy các bước kiểm thử và deploy lên Vercel.
4. **Bước 4**: Truy cập địa chỉ tên miền do Vercel cấp để nghiệm thu.

---

## 7. Hướng Dẫn Rollback Nếu Deploy Lỗi

Nếu phiên bản vừa deploy gặp sự cố ngoài dự kiến trên Production:

1. Truy cập Vercel Dashboard -> Chọn dự án **Học Hành Lắm**.
2. Vào tab **Deployments**.
3. Tìm phiên bản gần nhất đang hoạt động ổn định (có dấu tích xanh).
4. Bấm vào dấu **3 chấm (...)** ở bên phải phiên bản đó -> Chọn **Promote to Production**.
5. Vercel sẽ chuyển hướng lưu lượng truy cập về phiên bản ổn định ngay lập tức trong 2 giây mà không cần build lại code.

---

## 8. Hướng Dẫn Cập Nhật Phiên Bản Mới

1. Tạo một nhánh mới từ `main` (ví dụ: `git checkout -b feature/new-game`).
2. Phát triển tính năng và chạy kiểm thử `npm run typecheck`.
3. Tạo Pull Request vào nhánh `main`.
4. GitHub Actions `CI` sẽ tự động chạy kiểm tra mã nguồn.
5. Sau khi xem xét và bấm **Merge Pull Request**, GitHub Actions `CD` sẽ tự động phát hành phiên bản mới lên Production.

---

## 9. Hướng Dẫn Backup Database (Sao Lưu Cơ Sở Dữ Liệu PostgreSQL)

1. **Tự động sao lưu trên Supabase**:
   - Mọi dự án Supabase đều bật chế độ Daily Automated Backups trong 7 ngày gần nhất (tại mục **Database -> Backups**).
2. **Sao lưu thủ công bằng command line (`pg_dump`)**:
   ```bash
   pg_dump "postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" > hoc_hanh_lam_db_backup.sql
   ```
3. **Phục hồi dữ liệu (`psql`)**:
   ```bash
   psql "postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" < hoc_hanh_lam_db_backup.sql
   ```

---

## 10. Hướng Dẫn Backup Storage (Sao Lưu Tệp Đa Phương Tiện)

1. Mọi tệp ảnh bài học, ghi chú audio và video trong Supabase Storage bucket `library-assets` có thể sao lưu thông qua Supabase CLI:
   ```bash
   supabase storage download --project-ref [YOUR-PROJECT-REF] library-assets ./backup_storage_library
   ```
2. Lưu giữ thư mục `./backup_storage_library` trên ổ cứng an toàn hoặc dịch vụ sao lưu lạnh Cloud Storage.

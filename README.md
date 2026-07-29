# 🍃 Học Hành Lắm (LinguaVerse AI)
> **Nền Tảng Học Ngôn Ngữ Thông Minh Tích Hợp AI Agent, SRS Flashcard, Game Hóa & Quản Lý Tri Thức Multi-Media**

![Học Hành Lắm Banner](https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1200&q=80)

---

## 🌟 Giới Thiệu (Overview)

**Học Hành Lắm** (tên thương hiệu chính thức với biểu tượng chiếc lá xanh 🍃) là một ứng dụng web học ngôn ngữ toàn diện (Tiếng Anh 🇬🇧, Tiếng Hàn 🇰🇷, Tiếng Trung 🇨🇳) được thiết kế hiện đại trên nền tảng **Next.js 15 App Router**, **TypeScript**, **TailwindCSS**, **Radix UI**, **Supabase** và **OpenRouter AI (Gemini 2.5 Pro, Claude 3.5 Sonnet, GPT-4o, DeepSeek R1)**.

---

## 🔥 Các Phân Hệ Tính Năng Chính (Core Modules)

### 1. 📖 Kho Từ Vựng Thông Minh (Vocabulary Hub)
- Lưu trữ từ vựng chuyên sâu (IPA, Phiên âm, Từ loại, Ví dụ, Dịch nghĩa, Từ đồng nghĩa/trái nghĩa, Độ khó).
- Tích hợp **Text-to-Speech (TTS)** nghe phát âm chuẩn bản xứ.
- Lọc theo Ngôn ngữ, Độ khó, Bộ sưu tập, Đánh dấu sao Yêu thích.

### 2. 📘 Cấu Trúc Ngữ Pháp (Grammar Hub)
- Phân tích ngữ pháp chi tiết (Giải thích, Ví dụ thực tế, Lỗi sai thường gặp, Ngữ pháp liên quan).
- Nút **Giải Thích Ngữ Pháp Bằng AI** mở rộng kiến thức với ví dụ ngữ cảnh thực tế.

### 3. 🃏 Thẻ Ghi Nhớ & Thuật Toán Lặp Lại Ngắt Quãng SM-2 (Flashcards SRS Engine)
- Thuật toán **SuperMemo-2 (SM-2)** chuẩn quốc tế tính toán chu kỳ lặp lại tối ưu theo chỉ số Ease Factor ($EF$) và Interval ($I$).
- Giao diện lật thẻ 3D, cử chỉ vuốt Touch Swipe trên điện thoại & phím tắt bàn phím Desktop (`Space`, `1-4`).
- Cấu trúc cây Thư mục (Folders) và Bộ sưu tập (Decks) thẻ ghi nhớ.

### 4. 🤖 AI Center Hub & 8 Trợ Lý AI Chuyên Biệt (8 Subagents Hub)
- **SSE Streaming Interface** hội thoại trực tiếp với 8 AI Agents:
  1. 🔤 *Trợ Lý Từ Vựng (Vocabulary Agent)*
  2. ✍️ *Trợ Lý Ngữ Pháp (Grammar Agent)*
  3. 👩‍🏫 *Giáo Viên Hướng Dẫn (Teacher Agent)*
  4. 🗣️ *Trợ Lý Luyện Nói & Hội Thoại (Roleplay Agent)*
  5. 📅 *Lập Kế Hoạch Học Tập (Planner Agent)*
  6. 🔍 *Trợ Lý Tra Cứu (Search Agent)*
  7. 🌐 *Trợ Lý Dịch Thuật (Translation Agent)*
  8. 🎯 *Trợ Lý Gợi Ý Bài Học (Recommendation Agent)*

### 5. 📑 Document Center & AI Processing
- Tải lên / Dán clipboard tài liệu PDF, DOCX, PPT, TXT, Image, Screenshot, Book.
- **AI OCR & Extractor**: Trích xuất văn bản tự động, dịch nghĩa, khai thác từ vựng tự động, tạo bộ thẻ Flashcards và tạo đề kiểm tra Quiz.

### 6. 🔎 Semantic Search & Knowledge Graph Engine
- **Hybrid Search**: Kết hợp Embedding Vector Search + Supabase Full-Text Search qua 9 miền dữ liệu.
- Autocomplete, Lịch sử tìm kiếm, Command-K Quick Search modal (`Ctrl+K`).
- **Visual Knowledge Graph**: Sơ đồ mạng lưới tri thức trực quan kết nối Từ vựng, Ngữ pháp và Bài học.

### 7. 🎮 Learning Module & Gamification (Trò Chơi Học Tập)
- 8 chế độ game đa dạng: Quiz, Listening Quiz, Grammar Quiz, Vocabulary Quiz, Sentence Builder, Matching Game, Memory Game, Typing Game.
- Động cơ tích lũy XP, Thăng cấp Level, Chuỗi ngày Streak, Bảng Xếp Hạng (Leaderboard), Nhiệm vụ Hàng ngày & Hàng tuần.

### 8. 📂 Thư Viện Tri Thức Đa Phương Tiện (Library Manager)
- Quản lý tài nguyên đa phương tiện: Documents, Audio bài nghe (`.mp3`), Video bài giảng (`.mp4`), Images, Notes (`Markdown`).
- Lịch sử phiên bản (Version History & 1-click Rollback), Thùng rác (Trash Recovery), Đường dẫn chia sẻ (Share Link) và Download.

### 9. ⚙️ Settings, Profile & Control Center
- Quản lý Hồ sơ, Bio, Mục tiêu học (15m, 30m, 60m), Ngôn ngữ giao diện (100% Tiếng Việt), Theme.
- Nhập OpenRouter API Key cá nhân với nút kiểm tra kết nối (Test Key Connection).
- Sao lưu dữ liệu hệ thống dưới dạng tệp JSON (Export / Import Backup).
- Danh hiệu Huy chương (Achievements) & Báo cáo Thống kê Tiến độ (Analytics Charts).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Framework**: Next.js 15 (App Router, Server Actions, Client Components)
- **Language**: TypeScript 5.0 (Strict mode)
- **Styling**: Vanilla CSS, TailwindCSS, Lucide Icons, Glassmorphism Aesthetics
- **State Management**: Zustand, React Hooks
- **Database & Backend**: Supabase (PostgreSQL, RLS, Full-Text Search, Realtime)
- **AI Engine**: OpenRouter API (Gemini 2.5 Pro, Claude 3.5 Sonnet, GPT-4o, DeepSeek R1)
- **PWA**: Next-PWA Support for Offline Capabilities

---

## 🚀 Hướng Dẫn Cài Đặt Local (Local Setup)

1. **Clone Repository**:
   ```bash
   git clone https://github.com/your-username/linguaverse-ai.git
   cd linguaverse-ai
   ```

2. **Cài đặt Dependencies**:
   ```bash
   npm install
   ```

3. **Cấu hình Biến Môi Trường (`.env.local`)**:
   Tạo tệp `.env.local` tại thư mục gốc:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   OPENROUTER_API_KEY=your-openrouter-api-key
   ```

4. **Khởi Chạy Dev Server**:
   ```bash
   npm run dev
   ```
   Truy cập vào ứng dụng tại: `http://localhost:3000`

---

## 📜 Giấy Phép (License)

Dự án thuộc bản quyền thương hiệu **Học Hành Lắm** 🍃.

/**
 * LinguaVerse AI — Migration Script: Supabase → Neon DB
 *
 * Chuyển toàn bộ dữ liệu Vocabulary & Grammar từ Supabase sang Neon DB.
 * Script sử dụng schema ĐÚNG với cấu trúc bảng thực tế trong dự án.
 *
 * Chạy: node scripts/migrate-supabase-to-neon.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load biến môi trường từ .env.local
dotenv.config({ path: ".env.local" });

// --- Kiểm tra biến môi trường ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const neonUrl =
  process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local"
  );
  process.exit(1);
}

if (!neonUrl) {
  console.error(
    "❌ Thiếu NEON_DATABASE_URL trong .env.local\n" +
    "   Vui lòng thêm: NEON_DATABASE_URL=postgresql://... vào file .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const sql = neon(neonUrl);

// =============================================================================
// BƯỚC 1: Khởi tạo Schema trên Neon DB (ĐÚNG với cấu trúc dự án)
// =============================================================================
async function createNeonSchema() {
  console.log("📦 [1/4] Đang tạo Schema trên Neon DB...");

  // Bảng vocabulary — đúng với migration 00000000000002_vocabulary_module.sql
  await sql`
    CREATE TABLE IF NOT EXISTS vocabulary (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      language TEXT NOT NULL DEFAULT 'en',
      word TEXT NOT NULL,
      ipa TEXT NOT NULL DEFAULT '',
      vietnamese TEXT NOT NULL DEFAULT '',
      english_meaning TEXT NOT NULL DEFAULT '',
      part_of_speech TEXT NOT NULL DEFAULT 'noun',
      example TEXT NOT NULL DEFAULT '',
      example_translation TEXT NOT NULL DEFAULT '',
      audio_url TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      synonyms TEXT[] NOT NULL DEFAULT '{}',
      antonyms TEXT[] NOT NULL DEFAULT '{}',
      frequency INTEGER NOT NULL DEFAULT 3,
      difficulty TEXT NOT NULL DEFAULT 'intermediate',
      is_favorite BOOLEAN NOT NULL DEFAULT false,
      collection TEXT NOT NULL DEFAULT 'General',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // Indexes cho vocabulary
  await sql`CREATE INDEX IF NOT EXISTS idx_vocab_language ON vocabulary(language);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_vocab_collection ON vocabulary(collection);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_vocab_is_favorite ON vocabulary(is_favorite);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_vocab_created_at ON vocabulary(created_at DESC);`;

  // Bảng grammar — đúng với migration 00000000000003_grammar_module.sql
  await sql`
    CREATE TABLE IF NOT EXISTS grammar (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      language TEXT NOT NULL DEFAULT 'en',
      title TEXT NOT NULL,
      meaning TEXT NOT NULL DEFAULT '',
      explanation TEXT NOT NULL DEFAULT '',
      examples JSONB NOT NULL DEFAULT '[]'::jsonb,
      common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
      related_grammar TEXT[] NOT NULL DEFAULT '{}',
      difficulty TEXT NOT NULL DEFAULT 'intermediate',
      is_favorite BOOLEAN NOT NULL DEFAULT false,
      category TEXT NOT NULL DEFAULT 'General',
      ai_explanation TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // Indexes cho grammar
  await sql`CREATE INDEX IF NOT EXISTS idx_grammar_language ON grammar(language);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_grammar_category ON grammar(category);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_grammar_is_favorite ON grammar(is_favorite);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_grammar_created_at ON grammar(created_at DESC);`;

  console.log("✅ [1/4] Schema Neon DB đã sẵn sàng!\n");
}

// =============================================================================
// BƯỚC 2: Đọc dữ liệu từ Supabase
// =============================================================================
async function fetchFromSupabase() {
  console.log("📖 [2/4] Đang đọc dữ liệu từ Supabase...");

  const { data: vocabularies, error: vocabErr } = await supabase
    .from("vocabulary")
    .select("*")
    .order("created_at", { ascending: true });

  if (vocabErr) {
    console.warn("⚠️  Lỗi đọc bảng vocabulary từ Supabase:", vocabErr.message);
  } else {
    console.log(`   📚 Vocabulary: ${vocabularies?.length ?? 0} bản ghi`);
  }

  const { data: grammars, error: gramErr } = await supabase
    .from("grammar")
    .select("*")
    .order("created_at", { ascending: true });

  if (gramErr) {
    console.warn("⚠️  Lỗi đọc bảng grammar từ Supabase:", gramErr.message);
  } else {
    console.log(`   📝 Grammar: ${grammars?.length ?? 0} bản ghi`);
  }

  console.log("✅ [2/4] Đọc dữ liệu hoàn tất!\n");
  return {
    vocabularies: vocabularies || [],
    grammars: grammars || [],
  };
}

// =============================================================================
// BƯỚC 3: Chuyển dữ liệu sang Neon DB
// =============================================================================
async function migrateVocabulary(vocabularies) {
  if (vocabularies.length === 0) {
    console.log("ℹ️  Không có từ vựng nào để chuyển. Bỏ qua.\n");
    return;
  }

  console.log(
    `📚 [3/4] Đang chuyển ${vocabularies.length} từ vựng sang Neon DB...`
  );
  let success = 0;
  let failed = 0;

  for (const item of vocabularies) {
    try {
      await sql`
        INSERT INTO vocabulary (
          id, user_id, language, word, ipa, vietnamese, english_meaning,
          part_of_speech, example, example_translation, audio_url, image_url,
          synonyms, antonyms, frequency, difficulty, is_favorite, collection,
          created_at, updated_at
        ) VALUES (
          ${item.id},
          ${item.user_id ?? null},
          ${item.language ?? "en"},
          ${item.word ?? ""},
          ${item.ipa ?? ""},
          ${item.vietnamese ?? ""},
          ${item.english_meaning ?? ""},
          ${item.part_of_speech ?? "noun"},
          ${item.example ?? ""},
          ${item.example_translation ?? ""},
          ${item.audio_url ?? ""},
          ${item.image_url ?? ""},
          ${item.synonyms ?? []},
          ${item.antonyms ?? []},
          ${item.frequency ?? 3},
          ${item.difficulty ?? "intermediate"},
          ${item.is_favorite ?? false},
          ${item.collection ?? "General"},
          ${item.created_at ?? new Date().toISOString()},
          ${item.updated_at ?? new Date().toISOString()}
        )
        ON CONFLICT (id) DO UPDATE SET
          word = EXCLUDED.word,
          ipa = EXCLUDED.ipa,
          vietnamese = EXCLUDED.vietnamese,
          english_meaning = EXCLUDED.english_meaning,
          language = EXCLUDED.language,
          updated_at = EXCLUDED.updated_at;
      `;
      success++;
    } catch (err) {
      console.error(`   ❌ Lỗi từ "${item.word}":`, err.message);
      failed++;
    }
  }

  console.log(
    `✅ [3/4] Vocabulary: ${success} thành công${failed > 0 ? `, ${failed} lỗi` : ""}!\n`
  );
}

async function migrateGrammar(grammars) {
  if (grammars.length === 0) {
    console.log("ℹ️  Không có ngữ pháp nào để chuyển. Bỏ qua.\n");
    return;
  }

  console.log(
    `📝 [4/4] Đang chuyển ${grammars.length} ngữ pháp sang Neon DB...`
  );
  let success = 0;
  let failed = 0;

  for (const item of grammars) {
    try {
      await sql`
        INSERT INTO grammar (
          id, user_id, language, title, meaning, explanation, examples,
          common_mistakes, related_grammar, difficulty, is_favorite, category,
          ai_explanation, created_at, updated_at
        ) VALUES (
          ${item.id},
          ${item.user_id ?? null},
          ${item.language ?? "en"},
          ${item.title ?? ""},
          ${item.meaning ?? ""},
          ${item.explanation ?? ""},
          ${JSON.stringify(item.examples ?? [])},
          ${JSON.stringify(item.common_mistakes ?? [])},
          ${item.related_grammar ?? []},
          ${item.difficulty ?? "intermediate"},
          ${item.is_favorite ?? false},
          ${item.category ?? "General"},
          ${item.ai_explanation ?? ""},
          ${item.created_at ?? new Date().toISOString()},
          ${item.updated_at ?? new Date().toISOString()}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          meaning = EXCLUDED.meaning,
          explanation = EXCLUDED.explanation,
          language = EXCLUDED.language,
          updated_at = EXCLUDED.updated_at;
      `;
      success++;
    } catch (err) {
      console.error(`   ❌ Lỗi ngữ pháp "${item.title}":`, err.message);
      failed++;
    }
  }

  console.log(
    `✅ [4/4] Grammar: ${success} thành công${failed > 0 ? `, ${failed} lỗi` : ""}!\n`
  );
}

// =============================================================================
// MAIN
// =============================================================================
async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  🚀 LinguaVerse AI — Migration: Supabase → Neon DB");
  console.log("═══════════════════════════════════════════════════════\n");

  await createNeonSchema();
  const { vocabularies, grammars } = await fetchFromSupabase();
  await migrateVocabulary(vocabularies);
  await migrateGrammar(grammars);

  console.log("═══════════════════════════════════════════════════════");
  console.log("  ✨ MIGRATION HOÀN TẤT!");
  console.log("  Từ vựng & Ngữ pháp đã được chuyển sang Neon DB.");
  console.log("  Bước tiếp theo: Cập nhật services để đọc từ Neon.");
  console.log("═══════════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("\n❌ Lỗi nghiêm trọng:", err.message);
  console.error(err);
  process.exit(1);
});

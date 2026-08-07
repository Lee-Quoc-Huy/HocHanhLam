import { NextResponse } from "next/server";
import { queryNeon } from "@/lib/neon/client";

async function ensureTableExists() {
  await queryNeon(`
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
  `);
}

// GET /api/vocabulary
export async function GET() {
  try {
    await ensureTableExists();
    const rows = await queryNeon(
      `SELECT * FROM vocabulary ORDER BY created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("[API Vocabulary GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch vocabulary" },
      { status: 500 }
    );
  }
}

// POST /api/vocabulary
export async function POST(req: Request) {
  try {
    await ensureTableExists();
    const input = await req.json();

    const rows = await queryNeon(
      `INSERT INTO vocabulary (
        user_id, language, word, ipa, vietnamese, english_meaning,
        part_of_speech, example, example_translation, audio_url, image_url,
        synonyms, antonyms, frequency, difficulty, is_favorite, collection
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17
      ) RETURNING *`,
      [
        input.user_id ?? null,
        input.language ?? "en",
        input.word ?? "",
        input.ipa ?? "",
        input.vietnamese ?? "",
        input.english_meaning ?? "",
        input.part_of_speech ?? "noun",
        input.example ?? "",
        input.example_translation ?? "",
        input.audio_url ?? "",
        input.image_url ?? "",
        input.synonyms ?? [],
        input.antonyms ?? [],
        input.frequency ?? 3,
        input.difficulty ?? "intermediate",
        input.is_favorite ?? false,
        input.collection ?? "General",
      ]
    );

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error("[API Vocabulary POST] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create vocabulary item" },
      { status: 500 }
    );
  }
}

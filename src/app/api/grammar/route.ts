import { NextResponse } from "next/server";
import { queryNeon } from "@/lib/neon/client";

async function ensureTableExists() {
  await queryNeon(`
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
  `);
}

function parseGrammarRow(row: any) {
  if (!row) return row;
  return {
    ...row,
    examples:
      typeof row.examples === "string"
        ? JSON.parse(row.examples)
        : row.examples ?? [],
    common_mistakes:
      typeof row.common_mistakes === "string"
        ? JSON.parse(row.common_mistakes)
        : row.common_mistakes ?? [],
    related_grammar: row.related_grammar ?? [],
  };
}

// GET /api/grammar
export async function GET() {
  try {
    await ensureTableExists();
    const rows = await queryNeon(
      `SELECT * FROM grammar ORDER BY created_at DESC`
    );
    return NextResponse.json(rows.map(parseGrammarRow));
  } catch (error: any) {
    console.error("[API Grammar GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch grammar" },
      { status: 500 }
    );
  }
}

// POST /api/grammar
export async function POST(req: Request) {
  try {
    await ensureTableExists();
    const input = await req.json();

    const rows = await queryNeon(
      `INSERT INTO grammar (
        user_id, language, title, meaning, explanation, examples,
        common_mistakes, related_grammar, difficulty, is_favorite,
        category, ai_explanation
      ) VALUES (
        $1, $2, $3, $4, $5, $6::jsonb,
        $7::jsonb, $8, $9, $10,
        $11, $12
      ) RETURNING *`,
      [
        input.user_id ?? null,
        input.language ?? "en",
        input.title ?? "",
        input.meaning ?? "",
        input.explanation ?? "",
        JSON.stringify(input.examples ?? []),
        JSON.stringify(input.common_mistakes ?? []),
        input.related_grammar ?? [],
        input.difficulty ?? "intermediate",
        input.is_favorite ?? false,
        input.category ?? "General",
        input.ai_explanation ?? "",
      ]
    );

    return NextResponse.json(parseGrammarRow(rows[0]));
  } catch (error: any) {
    console.error("[API Grammar POST] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create grammar item" },
      { status: 500 }
    );
  }
}

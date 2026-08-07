import { NextResponse } from "next/server";
import { queryNeon } from "@/lib/neon/client";

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

// PUT /api/grammar/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();

    const fields = Object.keys(updates).filter((k) => k !== "id");
    if (fields.length === 0) {
      const existing = await queryNeon(`SELECT * FROM grammar WHERE id = $1`, [
        id,
      ]);
      return NextResponse.json(parseGrammarRow(existing[0]));
    }

    const jsonbFields = new Set(["examples", "common_mistakes"]);
    const setClauses = fields
      .map((field, idx) =>
        jsonbFields.has(field)
          ? `${field} = $${idx + 1}::jsonb`
          : `${field} = $${idx + 1}`
      )
      .join(", ");

    const values = fields.map((f) => {
      const val = updates[f];
      return jsonbFields.has(f) ? JSON.stringify(val) : val;
    });
    values.push(new Date().toISOString());
    values.push(id);

    const rows = await queryNeon(
      `UPDATE grammar SET ${setClauses}, updated_at = $${fields.length + 1}
       WHERE id = $${fields.length + 2} RETURNING *`,
      values
    );

    if (!rows[0]) {
      return NextResponse.json(
        { error: `Grammar item with id ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(parseGrammarRow(rows[0]));
  } catch (error: any) {
    console.error("[API Grammar PUT] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update grammar item" },
      { status: 500 }
    );
  }
}

// DELETE /api/grammar/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await queryNeon(`DELETE FROM grammar WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Grammar DELETE] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete grammar item" },
      { status: 500 }
    );
  }
}

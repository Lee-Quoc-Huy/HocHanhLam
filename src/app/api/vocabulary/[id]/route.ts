import { NextResponse } from "next/server";
import { queryNeon } from "@/lib/neon/client";

// PUT /api/vocabulary/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();

    const fields = Object.keys(updates).filter((k) => k !== "id");
    if (fields.length === 0) {
      const existing = await queryNeon(
        `SELECT * FROM vocabulary WHERE id = $1`,
        [id]
      );
      return NextResponse.json(existing[0]);
    }

    const setClauses = fields
      .map((field, idx) => `${field} = $${idx + 1}`)
      .join(", ");
    const values = fields.map((f) => updates[f]);
    values.push(new Date().toISOString());
    values.push(id);

    const rows = await queryNeon(
      `UPDATE vocabulary SET ${setClauses}, updated_at = $${fields.length + 1}
       WHERE id = $${fields.length + 2} RETURNING *`,
      values
    );

    if (!rows[0]) {
      return NextResponse.json(
        { error: `Vocabulary item with id ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error("[API Vocabulary PUT] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update vocabulary item" },
      { status: 500 }
    );
  }
}

// DELETE /api/vocabulary/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await queryNeon(`DELETE FROM vocabulary WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Vocabulary DELETE] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete vocabulary item" },
      { status: 500 }
    );
  }
}

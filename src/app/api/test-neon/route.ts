import { NextResponse } from "next/server";
import { queryNeon } from "@/lib/neon/client";

/**
 * GET /api/test-neon
 *
 * Endpoint chẩn đoán — kiểm tra kết nối Neon DB và trạng thái dữ liệu.
 * CHỈ DÙNG ĐỂ TEST. Xoá sau khi xác nhận hoạt động đúng.
 */
export async function GET() {
  const result: Record<string, any> = {
    timestamp: new Date().toISOString(),
    neon_url_configured: false,
    connection: "❌ Chưa kết nối",
    vocabulary: null,
    grammar: null,
    error: null,
  };

  const neonUrl =
    process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || null;

  if (!neonUrl) {
    result.error =
      "NEON_DATABASE_URL chưa được cấu hình. Hãy thêm vào Vercel Environment Variables.";
    return NextResponse.json(result, { status: 503 });
  }

  result.neon_url_configured = true;
  // Ẩn thông tin nhạy cảm, chỉ hiện host
  try {
    const url = new URL(neonUrl);
    result.neon_host = url.hostname;
  } catch {
    result.neon_host = "unknown";
  }

  try {
    // Test kết nối cơ bản
    const ping = await queryNeon<{ now: string }>("SELECT NOW() as now");
    result.connection = "✅ Kết nối thành công";
    result.server_time = ping[0]?.now;

    // Kiểm tra bảng vocabulary
    const vocabCount = await queryNeon<{ count: string }>(
      "SELECT COUNT(*) as count FROM vocabulary"
    );
    const vocabSample = await queryNeon<{ id: string; word: string; language: string }>(
      "SELECT id, word, language FROM vocabulary ORDER BY created_at DESC LIMIT 3"
    );
    result.vocabulary = {
      status: "✅ Bảng tồn tại",
      total_rows: parseInt(vocabCount[0]?.count ?? "0"),
      latest_3: vocabSample,
    };

    // Kiểm tra bảng grammar
    const grammarCount = await queryNeon<{ count: string }>(
      "SELECT COUNT(*) as count FROM grammar"
    );
    const grammarSample = await queryNeon<{ id: string; title: string; language: string }>(
      "SELECT id, title, language FROM grammar ORDER BY created_at DESC LIMIT 3"
    );
    result.grammar = {
      status: "✅ Bảng tồn tại",
      total_rows: parseInt(grammarCount[0]?.count ?? "0"),
      latest_3: grammarSample,
    };
  } catch (err: any) {
    result.connection = "❌ Lỗi kết nối";
    result.error = err?.message ?? String(err);

    // Kiểm tra nếu lỗi do bảng chưa tạo
    if (err?.message?.includes("does not exist")) {
      result.hint =
        "Bảng chưa được tạo trên Neon. Hãy chạy: node scripts/migrate-supabase-to-neon.mjs";
    }
  }

  return NextResponse.json(result, {
    status: result.error ? 500 : 200,
    headers: { "Content-Type": "application/json" },
  });
}

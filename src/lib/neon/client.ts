import { neon, neonConfig } from "@neondatabase/serverless";

/**
 * Neon DB Serverless Client
 *
 * Source of truth for Vocabulary & Grammar data when NEON_DATABASE_URL is set.
 */
neonConfig.fetchConnectionCache = true;

export function getNeonUrl(): string | null {
  return process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || null;
}

export function isNeonConfigured(): boolean {
  return Boolean(getNeonUrl());
}

/**
 * Execute a raw parameterized query against Neon DB.
 * Returns rows or throws if NEON_DATABASE_URL is not configured.
 */
export async function queryNeon<T = any>(
  queryText: string,
  params: any[] = []
): Promise<T[]> {
  const connectionString = getNeonUrl();
  if (!connectionString) {
    throw new Error(
      "[NeonDB] NEON_DATABASE_URL chưa được cấu hình. " +
        "Vui lòng thêm biến môi trường NEON_DATABASE_URL vào Vercel và .env.local."
    );
  }
  const sql = neon(connectionString);
  const result = await (sql as any).query(queryText, params);
  return (result?.rows ?? result) as T[];
}

import { neon, neonConfig } from "@neondatabase/serverless";

/**
 * Neon DB Serverless Client Configuration
 *
 * Uses NEON_DATABASE_URL from environment variables.
 * Enables SSL requirement by default for Neon PostgreSQL.
 */
neonConfig.fetchConnectionCache = true;

const getNeonUrl = (): string | null => {
  return process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || null;
};

export function getNeonSql() {
  const connectionString = getNeonUrl();
  if (!connectionString) {
    return null;
  }
  return neon(connectionString);
}

/**
 * Execute query against Neon DB. Returns result array or empty array if Neon URL is not configured.
 */
export async function queryNeon<T = any>(queryText: string, params: any[] = []): Promise<T[]> {
  const sql = getNeonSql();
  if (!sql) {
    console.warn("[NeonDB] NEON_DATABASE_URL is not set. Query skipped.");
    return [];
  }
  try {
    const result = await sql(queryText, params);
    return result as T[];
  } catch (err) {
    console.error("[NeonDB] Query error:", err);
    throw err;
  }
}

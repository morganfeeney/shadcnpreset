import { Pool, type QueryResultRow } from "pg"

let poolSingleton: Pool | null = null
let initPromise: Promise<void> | null = null

function getPool() {
  if (poolSingleton) {
    return poolSingleton
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is required")
  }

  poolSingleton = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  })

  return poolSingleton
}

async function ensureDbInitialized() {
  if (initPromise) {
    return initPromise
  }

  initPromise = (async () => {
    const pool = getPool()
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS preset_votes (
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        preset_code TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        PRIMARY KEY (user_id, preset_code)
      );

      CREATE INDEX IF NOT EXISTS idx_preset_votes_code ON preset_votes(preset_code);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    `)
  })()

  return initPromise
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
) {
  await ensureDbInitialized()
  const pool = getPool()
  return pool.query<T>(text, params)
}

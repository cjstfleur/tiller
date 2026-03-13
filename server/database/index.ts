import { createRequire } from 'node:module'
import { mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema'

const _require = createRequire(join(process.cwd(), 'server/index.mjs'))

type DbType = ReturnType<typeof drizzle<typeof schema>>
let _db: DbType | null = null

export function useDb(): DbType {
  if (_db) return _db

  const dbPath = process.env.TILLER_DB_PATH ?? './data/tiller.db'
  const dir = dirname(dbPath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  const Database = _require('better-sqlite3')
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  _db = drizzle(sqlite, { schema })

  migrate(_db, { migrationsFolder: './server/database/migrations' })

  return _db
}

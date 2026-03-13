import { randomBytes } from 'node:crypto'
import { eq, lt } from 'drizzle-orm'
import { useDb } from '../database/index'
import { sessions } from '../database/schema'

export const COOKIE_NAME = 'tiller_session'

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

export function createSession(token: string): Date {
  const db = useDb()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  db.insert(sessions).values({ token, expiresAt }).run()
  return expiresAt
}

export function validateSession(token: string): boolean {
  const db = useDb()
  const row = db.select().from(sessions).where(eq(sessions.token, token)).get()
  if (!row) return false
  if (row.expiresAt < new Date()) {
    db.delete(sessions).where(eq(sessions.token, token)).run()
    return false
  }
  return true
}

export function deleteSession(token: string): void {
  const db = useDb()
  db.delete(sessions).where(eq(sessions.token, token)).run()
}

export function purgeExpiredSessions(): void {
  const db = useDb()
  db.delete(sessions).where(lt(sessions.expiresAt, new Date())).run()
}

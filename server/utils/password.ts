import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { useDb } from '../database/index'
import { auth } from '../database/schema'

export async function verifyPassword(candidate: string): Promise<boolean> {
  const envPassword = process.env.TILLER_PASSWORD
  if (envPassword) {
    return candidate === envPassword
  }
  const db = useDb()
  const row = db.select().from(auth).where(eq(auth.key, 'password')).get()
  if (!row) return false
  return bcrypt.compare(candidate, row.hash)
}

export async function setPassword(plaintext: string): Promise<void> {
  const hash = await bcrypt.hash(plaintext, 12)
  const db = useDb()
  db.insert(auth)
    .values({ key: 'password', hash })
    .onConflictDoUpdate({ target: auth.key, set: { hash } })
    .run()
}

export function isPasswordConfigured(): boolean {
  if (process.env.TILLER_PASSWORD) return true
  const db = useDb()
  const row = db.select().from(auth).where(eq(auth.key, 'password')).get()
  return !!row
}

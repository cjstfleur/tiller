import { asc } from 'drizzle-orm'
import { useDb } from '../../database/index'
import { chatMessages } from '../../database/schema'

export default defineEventHandler(() => {
  const db = useDb()
  const rows = db.select().from(chatMessages).orderBy(asc(chatMessages.createdAt)).all()
  return rows.map(r => ({
    id: r.id,
    role: r.role,
    parts: JSON.parse(r.parts),
    model: r.model ?? undefined
  }))
})

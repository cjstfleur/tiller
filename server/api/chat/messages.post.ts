import { useDb } from '../../database/index'
import { chatMessages } from '../../database/schema'

interface MessageBody {
  id: string
  role: string
  parts: unknown[]
  model?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<MessageBody>(event)
  if (!body?.id || !body?.role || !body?.parts) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid message body' })
  }

  const db = useDb()
  db.insert(chatMessages)
    .values({
      id: body.id,
      role: body.role,
      parts: JSON.stringify(body.parts),
      model: body.model ?? null,
      createdAt: new Date()
    })
    .run()

  return { ok: true }
})

import { useDb } from '../database/index'
import { settings } from '../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, string>>(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
  }

  const db = useDb()

  for (const [key, value] of Object.entries(body)) {
    db.insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } })
      .run()
  }

  return { ok: true }
})

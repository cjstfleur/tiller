import { useDb } from '../../database/index'
import { integrations } from '../../database/schema'

interface IntegrationUpdate {
  baseUrl?: string | null
  username?: string | null
  apiKey?: string | null
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, IntegrationUpdate>>(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
  }

  const db = useDb()

  for (const [id, config] of Object.entries(body)) {
    db.insert(integrations)
      .values({
        id,
        baseUrl: config.baseUrl ?? null,
        username: config.username ?? null,
        apiKey: config.apiKey ?? null,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: integrations.id,
        set: {
          baseUrl: config.baseUrl ?? null,
          username: config.username ?? null,
          apiKey: config.apiKey ?? null,
          updatedAt: new Date()
        }
      })
      .run()
  }

  return { ok: true }
})

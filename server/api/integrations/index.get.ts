import { useDb } from '../../database/index'
import { integrations } from '../../database/schema'

const INTEGRATION_IDS = ['ollama', 'uptimeKuma', 'pihole', 'n8n', 'npm'] as const

export default defineEventHandler(() => {
  const db = useDb()
  const rows = db.select().from(integrations).all()
  const map = Object.fromEntries(
    rows.map(r => [r.id, { baseUrl: r.baseUrl ?? null, username: r.username ?? null, apiKey: r.apiKey ?? null }])
  )

  return Object.fromEntries(
    INTEGRATION_IDS.map(id => [id, map[id] ?? { baseUrl: null, username: null, apiKey: null }])
  )
})

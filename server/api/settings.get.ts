import { useDb } from '../database/index'
import { settings } from '../database/schema'

const DEFAULTS: Record<string, string> = {
  refreshInterval: '30s',
  theme: 'system'
}

export default defineEventHandler(() => {
  const db = useDb()
  const rows = db.select().from(settings).all()
  const stored = Object.fromEntries(rows.map(r => [r.key, r.value]))
  return { ...DEFAULTS, ...stored }
})

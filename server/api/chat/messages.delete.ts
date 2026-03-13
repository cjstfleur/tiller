import { useDb } from '../../database/index'
import { chatMessages } from '../../database/schema'

export default defineEventHandler(() => {
  const db = useDb()
  db.delete(chatMessages).run()
  return { ok: true }
})

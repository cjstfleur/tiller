import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const integrations = sqliteTable('integrations', {
  id: text('id').primaryKey(),
  baseUrl: text('base_url'),
  username: text('username'),
  apiKey: text('api_key'),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
})

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull()
})

export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  role: text('role').notNull(),
  parts: text('parts').notNull(),
  model: text('model'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const sessions = sqliteTable('sessions', {
  token: text('token').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
})

export const auth = sqliteTable('auth', {
  key: text('key').primaryKey(),
  hash: text('hash').notNull()
})

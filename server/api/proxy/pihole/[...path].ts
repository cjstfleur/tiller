import { eq } from 'drizzle-orm'
import { useDb } from '../../../database/index'
import { integrations, settings } from '../../../database/schema'

const SID_KEY = 'pihole:sid'

let authPromise: Promise<string | null> | null = null

async function getStoredSid(): Promise<string | null> {
  const db = useDb()
  const row = db.select().from(settings).where(eq(settings.key, SID_KEY)).get()
  return row?.value ?? null
}

async function storeSid(sid: string): Promise<void> {
  const db = useDb()
  db.insert(settings)
    .values({ key: SID_KEY, value: sid })
    .onConflictDoUpdate({ target: settings.key, set: { value: sid } })
    .run()
}

async function clearSid(): Promise<void> {
  const db = useDb()
  db.delete(settings).where(eq(settings.key, SID_KEY)).run()
}

async function authenticate(baseUrl: string, password: string): Promise<string | null> {
  try {
    const res = await fetch(`${baseUrl}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    if (!res.ok) return null
    const data = await res.json() as { session?: { sid?: string } }
    const sid = data?.session?.sid ?? null
    if (sid) await storeSid(sid)
    return sid
  } catch {
    return null
  }
}

async function getSid(baseUrl: string, password: string): Promise<string | null> {
  const stored = await getStoredSid()
  if (stored) return stored

  if (!authPromise) {
    authPromise = authenticate(baseUrl, password).finally(() => {
      authPromise = null
    })
  }
  return authPromise
}

export default defineEventHandler(async (event) => {
  const db = useDb()
  const row = db.select().from(integrations).where(eq(integrations.id, 'pihole')).get()

  if (!row?.baseUrl || !row?.apiKey) {
    throw createError({ statusCode: 503, statusMessage: 'Pi-hole not configured' })
  }

  const { baseUrl, apiKey: password } = row

  const pathParam = getRouterParam(event, 'path') ?? ''
  const query = getQuery(event)
  const queryString = new URLSearchParams(query as Record<string, string>).toString()
  const upstreamPath = `/${pathParam}${queryString ? `?${queryString}` : ''}`
  const upstreamUrl = `${baseUrl.replace(/\/$/, '')}${upstreamPath}`

  const method = event.method
  const hasBody = method !== 'GET' && method !== 'HEAD'
  const bodyBuffer = hasBody ? await readRawBody(event) : undefined

  const doRequest = async (sid: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (sid) headers['X-FTL-SID'] = sid

    return fetch(upstreamUrl, { method, headers, body: bodyBuffer })
  }

  let sid = await getSid(baseUrl, password)
  let upstream: Response
  try {
    upstream = await doRequest(sid)
    // Retry once on 401
    if (upstream.status === 401) {
      await clearSid()
      authPromise = null
      sid = await getSid(baseUrl, password)
      upstream = await doRequest(sid)
    }
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Pi-hole unreachable' })
  }

  setResponseStatus(event, upstream.status)
  upstream.headers.forEach((value, key) => {
    const k = key.toLowerCase()
    if (k === 'transfer-encoding' || k === 'content-encoding' || k === 'content-length') return
    setResponseHeader(event, key, value)
  })

  if (!upstream.body) return null
  return sendStream(event, upstream.body)
})

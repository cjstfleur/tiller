import { eq } from 'drizzle-orm'
import { useDb } from '../../../database/index'
import { integrations, settings } from '../../../database/schema'

const TOKEN_KEY = 'npm:token'

let authPromise: Promise<string | null> | null = null

async function getStoredToken(): Promise<string | null> {
  const db = useDb()
  const row = db.select().from(settings).where(eq(settings.key, TOKEN_KEY)).get()
  return row?.value ?? null
}

async function storeToken(token: string): Promise<void> {
  const db = useDb()
  db.insert(settings)
    .values({ key: TOKEN_KEY, value: token })
    .onConflictDoUpdate({ target: settings.key, set: { value: token } })
    .run()
}

async function clearToken(): Promise<void> {
  const db = useDb()
  db.delete(settings).where(eq(settings.key, TOKEN_KEY)).run()
}

async function authenticate(baseUrl: string, identity: string, secret: string): Promise<string | null> {
  try {
    const res = await fetch(`${baseUrl}/api/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity, secret })
    })
    if (!res.ok) return null
    const data = await res.json() as { token?: string }
    const token = data?.token ?? null
    if (token) await storeToken(token)
    return token
  } catch {
    return null
  }
}

async function getToken(baseUrl: string, identity: string, secret: string): Promise<string | null> {
  const stored = await getStoredToken()
  if (stored) return stored

  if (!authPromise) {
    authPromise = authenticate(baseUrl, identity, secret).finally(() => {
      authPromise = null
    })
  }
  return authPromise
}

export default defineEventHandler(async (event) => {
  const db = useDb()
  const row = db.select().from(integrations).where(eq(integrations.id, 'npm')).get()

  if (!row?.baseUrl || !row?.username || !row?.apiKey) {
    throw createError({ statusCode: 503, statusMessage: 'Nginx Proxy Manager not configured' })
  }

  const { baseUrl, username: identity, apiKey: secret } = row

  const pathParam = getRouterParam(event, 'path') ?? ''
  const query = getQuery(event)
  const queryString = new URLSearchParams(query as Record<string, string>).toString()
  const upstreamPath = `/${pathParam}${queryString ? `?${queryString}` : ''}`
  const upstreamUrl = `${baseUrl.replace(/\/$/, '')}${upstreamPath}`

  const method = event.method
  const hasBody = method !== 'GET' && method !== 'HEAD'
  const bodyBuffer = hasBody ? await readRawBody(event) : undefined

  const doRequest = async (token: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    return fetch(upstreamUrl, { method, headers, body: bodyBuffer })
  }

  let token = await getToken(baseUrl, identity, secret)
  let upstream: Response
  try {
    upstream = await doRequest(token)
    // Retry once on 401 (token expired)
    if (upstream.status === 401) {
      await clearToken()
      authPromise = null
      token = await getToken(baseUrl, identity, secret)
      upstream = await doRequest(token)
    }
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Nginx Proxy Manager unreachable' })
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

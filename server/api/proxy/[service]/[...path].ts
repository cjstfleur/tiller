import { eq } from 'drizzle-orm'
import { useDb } from '../../../database/index'
import { integrations } from '../../../database/schema'

// Dedicated proxy handlers exist for pihole and npm — this handles the remaining three
const ALLOWED_SERVICES = ['ollama', 'uptimeKuma', 'n8n'] as const
type AllowedService = typeof ALLOWED_SERVICES[number]

function buildAuthHeaders(serviceId: AllowedService, apiKey: string | null): Record<string, string> {
  if (!apiKey) return {}
  if (serviceId === 'uptimeKuma') {
    return { Authorization: `Basic ${Buffer.from(`:${apiKey}`).toString('base64')}` }
  }
  if (serviceId === 'n8n') {
    return { 'X-N8N-API-KEY': apiKey }
  }
  return {}
}

export default defineEventHandler(async (event) => {
  const serviceId = getRouterParam(event, 'service') as string

  if (!ALLOWED_SERVICES.includes(serviceId as AllowedService)) {
    throw createError({ statusCode: 400, statusMessage: `Unknown service: ${serviceId}` })
  }

  const db = useDb()
  const row = db.select().from(integrations).where(eq(integrations.id, serviceId)).get()

  if (!row?.baseUrl) {
    throw createError({ statusCode: 503, statusMessage: `${serviceId} not configured` })
  }

  const pathParam = getRouterParam(event, 'path') ?? ''
  const query = getQuery(event)
  const queryString = new URLSearchParams(query as Record<string, string>).toString()
  const upstreamPath = `/${pathParam}${queryString ? `?${queryString}` : ''}`
  const upstreamUrl = `${row.baseUrl.replace(/\/$/, '')}${upstreamPath}`

  // Strip incoming headers except host; inject service auth from DB
  const incomingHeaders = getHeaders(event)
  const forwardHeaders: Record<string, string> = {}
  for (const [k, v] of Object.entries(incomingHeaders)) {
    if (k.toLowerCase() !== 'host' && v !== undefined) {
      forwardHeaders[k] = v
    }
  }
  Object.assign(forwardHeaders, buildAuthHeaders(serviceId as AllowedService, row.apiKey ?? null))

  const method = event.method
  const hasBody = method !== 'GET' && method !== 'HEAD'
  const body = hasBody ? await readRawBody(event) : undefined

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, { method, headers: forwardHeaders, body })
  } catch {
    throw createError({ statusCode: 502, statusMessage: `Upstream ${serviceId} unreachable` })
  }

  setResponseStatus(event, upstream.status)
  upstream.headers.forEach((value, key) => {
    const k = key.toLowerCase()
    // Node.js fetch() auto-decompresses gzip — strip encoding/length headers so the
    // browser does not try to decompress the already-decompressed response body
    if (k === 'transfer-encoding' || k === 'content-encoding' || k === 'content-length') return
    setResponseHeader(event, key, value)
  })

  if (!upstream.body) return null
  return sendStream(event, upstream.body)
})

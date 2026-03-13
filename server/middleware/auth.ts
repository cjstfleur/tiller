import { validateSession, COOKIE_NAME } from '../utils/session'
import { isPasswordConfigured } from '../utils/password'

export default defineEventHandler((event) => {
  const path = event.path

  // Only protect API routes
  if (!path.startsWith('/api/')) return

  // Auth routes are always public
  if (path.startsWith('/api/auth/')) return

  // First-run: block all API routes except /api/auth/setup
  if (!isPasswordConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Setup required' })
  }

  const token = getCookie(event, COOKIE_NAME)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})

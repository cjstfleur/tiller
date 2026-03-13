import { validateSession, COOKIE_NAME } from '../../utils/session'
import { isPasswordConfigured } from '../../utils/password'

export default defineEventHandler((event) => {
  const setupRequired = !isPasswordConfigured()
  const token = getCookie(event, COOKIE_NAME)
  const authenticated = !setupRequired && !!token && validateSession(token)
  return { authenticated, setupRequired }
})

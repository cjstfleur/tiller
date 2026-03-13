import { deleteSession, COOKIE_NAME } from '../../utils/session'

export default defineEventHandler((event) => {
  const token = getCookie(event, COOKIE_NAME)
  if (token) deleteSession(token)
  deleteCookie(event, COOKIE_NAME)
  return { ok: true }
})

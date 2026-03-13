import { verifyPassword } from '../../utils/password'
import { generateToken, createSession, COOKIE_NAME } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ password: string }>(event)
  if (!body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Password required' })
  }

  const valid = await verifyPassword(body.password)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid password' })
  }

  const token = generateToken()
  const expiresAt = createSession(token)

  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/'
  })

  return { ok: true }
})

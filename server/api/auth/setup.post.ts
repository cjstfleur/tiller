import { setPassword, isPasswordConfigured } from '../../utils/password'
import { generateToken, createSession, COOKIE_NAME } from '../../utils/session'

export default defineEventHandler(async (event) => {
  if (isPasswordConfigured()) {
    throw createError({ statusCode: 403, statusMessage: 'Already configured' })
  }

  const body = await readBody<{ password: string }>(event)
  if (!body?.password || body.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }

  await setPassword(body.password)

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

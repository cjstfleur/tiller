interface AuthSession {
  authenticated: boolean
  setupRequired: boolean
}

export const useAuth = () => {
  const session = useState<AuthSession | null>('auth-session', () => null)

  const fetchSession = async () => {
    session.value = await $fetch<AuthSession>('/api/auth/session')
  }

  const login = async (password: string) => {
    await $fetch('/api/auth/login', { method: 'POST', body: { password } })
    await fetchSession()
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    session.value = { authenticated: false, setupRequired: false }
    await navigateTo('/login')
  }

  return { session, fetchSession, login, logout }
}

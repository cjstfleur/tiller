export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login' || to.path === '/setup') return

  const { session, fetchSession } = useAuth()

  if (!session.value) {
    await fetchSession()
  }

  if (session.value?.setupRequired) {
    return navigateTo('/setup')
  }

  if (!session.value?.authenticated) {
    return navigateTo('/login')
  }
})

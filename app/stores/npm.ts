import { createNpmService, type NpmProxyHost, type NpmCertificate } from '~/services/npm'

const EXPIRY_WARNING_DAYS = 30

export const useNpmStore = defineStore('npm', () => {
  const { baseUrl, apiKey, isConfigured: baseConfigured } = useIntegrationConfig('npm')

  const loading = ref(true)
  const proxyHosts = ref<NpmProxyHost[]>([])
  const certificates = ref<NpmCertificate[]>([])
  const status = ref<'online' | 'warning' | 'offline' | 'loading'>('loading')
  const error = ref<string | null>(null)

  const isConfigured = computed(() => baseConfigured.value && !!apiKey.value)

  const enabledCount = computed(() => proxyHosts.value.filter(h => h.enabled).length)

  const expiringCount = computed(() => {
    const threshold = Date.now() + EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000
    return certificates.value.filter(c => new Date(c.expires_on).getTime() <= threshold).length
  })

  const subtitle = computed(() => {
    if (!isConfigured.value) return 'Not configured'
    if (status.value === 'loading') return null
    if (status.value === 'offline') return 'Unreachable'
    return `${proxyHosts.value.length} hosts · ${certificates.value.length} certs`
  })

  const stats = computed(() => [
    { label: 'Hosts', value: status.value === 'loading' ? null : String(proxyHosts.value.length) },
    { label: 'Certs', value: status.value === 'loading' ? null : String(certificates.value.length) }
  ])

  const refresh = async () => {
    const url = baseUrl.value
    const token = apiKey.value
    if (!url || !token) {
      loading.value = false
      status.value = 'offline'
      return
    }

    status.value = 'loading'
    error.value = null
    try {
      const service = createNpmService(url, token)
      const [hosts, certs] = await Promise.all([
        service.fetchProxyHosts(),
        service.fetchCertificates()
      ])
      proxyHosts.value = hosts
      certificates.value = certs
      status.value = expiringCount.value > 0 ? 'warning' : 'online'
    } catch (e) {
      status.value = 'offline'
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  watch([baseUrl, apiKey], ([url, token]) => {
    if (url && token) refresh()
    else {
      loading.value = false
      status.value = 'offline'
    }
  }, { immediate: true })

  return {
    loading,
    proxyHosts,
    certificates,
    status,
    error,
    isConfigured,
    enabledCount,
    expiringCount,
    subtitle,
    stats,
    refresh
  }
})

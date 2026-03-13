import { createPiholeService, type PiholeSummary, type PiholeTopBlockedEntry } from '~/services/pihole'

export const usePiholeStore = defineStore('pihole', () => {
  const { baseUrl, apiKey, isConfigured: baseConfigured } = useIntegrationConfig('pihole')

  const loading = ref(true)
  const status = ref<'online' | 'offline' | 'loading'>('loading')
  const error = ref<string | null>(null)

  const queriesTotal = ref(0)
  const queriesBlocked = ref(0)
  const blockRate = ref(0)
  const domainsBlocked = ref(0)
  const topBlocked = ref<PiholeTopBlockedEntry[]>([])

  const isConfigured = computed(() => baseConfigured.value && !!apiKey.value)

  const formatCount = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
    return String(n)
  }

  const subtitle = computed(() => {
    if (!isConfigured.value) return 'Not configured'
    if (status.value === 'loading') return null
    if (status.value === 'offline') return 'Unreachable'
    return `${blockRate.value.toFixed(1)}% blocked today`
  })

  const stats = computed(() => [
    { label: 'Blocked', value: status.value === 'loading' ? null : formatCount(queriesBlocked.value) },
    { label: 'Rate', value: status.value === 'loading' ? null : `${blockRate.value.toFixed(1)}%` }
  ])

  let service: { fetchSummary: () => Promise<PiholeSummary>, fetchTopBlocked: (count?: number) => Promise<PiholeTopBlockedEntry[]> } | null = null

  const refresh = async () => {
    if (!service) {
      loading.value = false
      status.value = 'offline'
      return
    }

    const svc = service
    status.value = 'loading'
    error.value = null
    try {
      const [summary, top] = await Promise.all([
        svc.fetchSummary(),
        svc.fetchTopBlocked(5)
      ])
      queriesTotal.value = summary.queries.total
      queriesBlocked.value = summary.queries.blocked
      blockRate.value = summary.queries.percent_blocked
      domainsBlocked.value = summary.gravity.domains_being_blocked
      topBlocked.value = top
      status.value = 'online'
    } catch (e) {
      status.value = 'offline'
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  watch([baseUrl, apiKey], ([url, key]) => {
    service = url && key ? createPiholeService(url, key) : null
    if (service) refresh()
    else {
      loading.value = false
      status.value = 'offline'
    }
  }, { immediate: true })

  return {
    loading,
    status,
    error,
    isConfigured,
    queriesTotal,
    queriesBlocked,
    blockRate,
    domainsBlocked,
    topBlocked,
    subtitle,
    stats,
    refresh
  }
})

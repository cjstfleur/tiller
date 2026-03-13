import { createUptimeKumaService, type UptimeKumaMonitor } from '~/services/uptimeKuma'

export const useUptimeKumaStore = defineStore('uptimeKuma', () => {
  const { baseUrl, apiKey, isConfigured: baseConfigured } = useIntegrationConfig('uptimeKuma')

  const loading = ref(true)
  const monitors = ref<UptimeKumaMonitor[]>([])
  const status = ref<'online' | 'offline' | 'loading'>('loading')
  const error = ref<string | null>(null)

  const isConfigured = computed(() => baseConfigured.value && !!apiKey.value)

  const onlineCount = computed(() => monitors.value.filter(m => m.lastStatus === 1).length)
  const totalCount = computed(() => monitors.value.length)

  const overallUptime = computed(() => {
    const withUptime = monitors.value.filter(m => m.uptime24h !== null)
    if (!withUptime.length) return null
    const avg = withUptime.reduce((sum, m) => sum + (m.uptime24h ?? 0), 0) / withUptime.length
    return Math.round(avg * 10) / 10
  })

  const avgPing = computed(() => {
    const withPing = monitors.value.filter(m => m.avgPing !== null)
    if (!withPing.length) return null
    return Math.round(withPing.reduce((sum, m) => sum + (m.avgPing ?? 0), 0) / withPing.length)
  })

  const subtitle = computed(() => {
    if (!isConfigured.value) return 'Not configured'
    if (status.value === 'loading') return null
    if (status.value === 'offline') return 'Unreachable'
    return `${onlineCount.value} / ${totalCount.value} online`
  })

  const stats = computed(() => [
    { label: 'Up', value: status.value === 'loading' ? null : `${onlineCount.value}/${totalCount.value}` },
    { label: 'Avg', value: status.value === 'loading' ? null : (avgPing.value !== null ? `${avgPing.value}ms` : '—') }
  ])

  const monitorStatus = (monitor: UptimeKumaMonitor): 'green' | 'yellow' | 'red' => {
    if (monitor.lastStatus !== 1) return 'red'
    if (monitor.uptime24h === null) return 'green'
    if (monitor.uptime24h >= 90) return 'green'
    if (monitor.uptime24h >= 50) return 'yellow'
    return 'red'
  }

  const refresh = async () => {
    const url = baseUrl.value
    const key = apiKey.value
    if (!url || !key) {
      loading.value = false
      status.value = 'offline'
      return
    }

    status.value = 'loading'
    error.value = null
    try {
      const service = createUptimeKumaService(url, key)
      monitors.value = await service.fetchMonitors()
      status.value = 'online'
    } catch (e) {
      status.value = 'offline'
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  watch([baseUrl, apiKey], ([url, key]) => {
    if (url && key) refresh()
    else {
      loading.value = false
      status.value = 'offline'
    }
  }, { immediate: true })

  return {
    loading,
    monitors,
    status,
    error,
    isConfigured,
    onlineCount,
    totalCount,
    overallUptime,
    avgPing,
    subtitle,
    stats,
    monitorStatus,
    refresh
  }
})

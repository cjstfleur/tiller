export interface ServiceStat {
  label: string
  value: string
}

export interface Service {
  id: string
  name: string
  icon: string
  accentColor: 'blue' | 'green' | 'purple' | 'orange'
  badge: { label: string, color: string }
  status: 'online' | 'warning' | 'offline'
  subtitle: string
  stats: [ServiceStat, ServiceStat]
  pinned: boolean
}

export const useServicesStore = defineStore('services', () => {
  const ollamaConfig = useIntegrationConfig('ollama')

  const services = ref<Service[]>([
    {
      id: 'ollama',
      name: 'Ollama',
      icon: 'i-simple-icons-ollama',
      accentColor: 'blue',
      badge: { label: 'AI', color: 'blue' },
      status: 'offline',
      subtitle: '',
      stats: [
        { label: 'Models', value: '—' },
        { label: 'Status', value: '—' }
      ],
      pinned: true
    },
    {
      id: 'uptime-kuma',
      name: 'Uptime Kuma',
      icon: 'i-lucide-activity',
      accentColor: 'green',
      badge: { label: 'Monitoring', color: 'green' },
      status: 'online',
      subtitle: '7 / 8 services up',
      stats: [
        { label: 'Up', value: '7/8' },
        { label: 'Avg', value: '14ms' }
      ],
      pinned: true
    },
    {
      id: 'pihole',
      name: 'Pi-hole',
      icon: 'i-simple-icons-pihole',
      accentColor: 'purple',
      badge: { label: 'Network', color: 'purple' },
      status: 'online',
      subtitle: '28.4% blocked today',
      stats: [
        { label: 'Blocked', value: '13.7k' },
        { label: 'Rate', value: '28%' }
      ],
      pinned: true
    },
    {
      id: 'n8n',
      name: 'n8n',
      icon: 'i-simple-icons-n8n',
      accentColor: 'orange',
      badge: { label: 'Automation', color: 'orange' },
      status: 'offline',
      subtitle: '',
      stats: [
        { label: 'Runs (7d)', value: '—' },
        { label: 'Errors (7d)', value: '—' }
      ],
      pinned: true
    },
    {
      id: 'npm',
      name: 'Nginx Proxy Manager',
      icon: 'i-simple-icons-nginx',
      accentColor: 'blue',
      badge: { label: 'Proxy', color: 'blue' },
      status: 'offline',
      subtitle: '',
      stats: [
        { label: 'Hosts', value: '—' },
        { label: 'Certs', value: '—' }
      ],
      pinned: true
    }
  ])

  // Keep Ollama service entry in sync with the Ollama store
  const ollamaStore = useOllamaStore()
  watch(
    () => [ollamaStore.status, ollamaStore.subtitle, ollamaStore.stats] as const,
    () => {
      const entry = services.value.find(s => s.id === 'ollama')
      if (!entry) return
      entry.status = ollamaStore.status === 'loading' ? 'offline' : ollamaStore.status
      entry.subtitle = ollamaStore.subtitle ?? ''
      if (ollamaStore.stats[0] && ollamaStore.stats[1]) {
        entry.stats[0].value = ollamaStore.stats[0].value ?? '—'
        entry.stats[1].value = ollamaStore.stats[1].value ?? '—'
      }
    },
    { immediate: true }
  )

  // Keep Uptime Kuma service entry in sync with the Uptime Kuma store
  const uptimeKumaStore = useUptimeKumaStore()
  watch(
    () => [uptimeKumaStore.status, uptimeKumaStore.subtitle, uptimeKumaStore.stats] as const,
    () => {
      const entry = services.value.find(s => s.id === 'uptime-kuma')
      if (!entry) return
      entry.status = uptimeKumaStore.status === 'loading' ? 'offline' : uptimeKumaStore.status
      entry.subtitle = uptimeKumaStore.subtitle ?? ''
      if (uptimeKumaStore.stats[0] && uptimeKumaStore.stats[1]) {
        entry.stats[0].value = uptimeKumaStore.stats[0].value ?? '—'
        entry.stats[1].value = uptimeKumaStore.stats[1].value ?? '—'
      }
    },
    { immediate: true }
  )

  // Keep Pi-hole service entry in sync with the Pi-hole store
  const piholeStore = usePiholeStore()
  watch(
    () => [piholeStore.status, piholeStore.subtitle, piholeStore.stats] as const,
    () => {
      const entry = services.value.find(s => s.id === 'pihole')
      if (!entry) return
      entry.status = piholeStore.status === 'loading' ? 'offline' : piholeStore.status
      entry.subtitle = piholeStore.subtitle ?? ''
      if (piholeStore.stats[0] && piholeStore.stats[1]) {
        entry.stats[0].value = piholeStore.stats[0].value ?? '—'
        entry.stats[1].value = piholeStore.stats[1].value ?? '—'
      }
    },
    { immediate: true }
  )

  // Keep n8n service entry in sync with the n8n store
  const n8nStore = useN8nStore()
  watch(
    () => [n8nStore.status, n8nStore.subtitle, n8nStore.stats] as const,
    () => {
      const entry = services.value.find(s => s.id === 'n8n')
      if (!entry) return
      entry.status = n8nStore.status === 'loading' ? 'offline' : n8nStore.status
      entry.subtitle = n8nStore.subtitle ?? ''
      if (n8nStore.stats[0] && n8nStore.stats[1]) {
        entry.stats[0].value = n8nStore.stats[0].value ?? '—'
        entry.stats[1].value = n8nStore.stats[1].value ?? '—'
      }
    },
    { immediate: true }
  )

  // Keep Nginx Proxy Manager service entry in sync with the npm store
  const npmStore = useNpmStore()
  watch(
    () => [npmStore.status, npmStore.subtitle, npmStore.stats] as const,
    () => {
      const entry = services.value.find(s => s.id === 'npm')
      if (!entry) return
      entry.status = npmStore.status === 'loading' ? 'offline' : npmStore.status
      entry.subtitle = npmStore.subtitle ?? ''
      if (npmStore.stats[0] && npmStore.stats[1]) {
        entry.stats[0].value = npmStore.stats[0].value ?? '—'
        entry.stats[1].value = npmStore.stats[1].value ?? '—'
      }
    },
    { immediate: true }
  )

  const configuredIds = computed(() => {
    const ids: string[] = []
    if (ollamaConfig.isConfigured.value) ids.push('ollama')
    if (uptimeKumaStore.isConfigured) ids.push('uptime-kuma')
    if (piholeStore.isConfigured) ids.push('pihole')
    if (n8nStore.isConfigured) ids.push('n8n')
    if (npmStore.isConfigured) ids.push('npm')
    return ids
  })

  const configuredServices = computed(() =>
    services.value.filter(s => configuredIds.value.includes(s.id))
  )

  const summary = computed(() => ({
    online: configuredServices.value.filter(s => s.status === 'online').length,
    warning: configuredServices.value.filter(s => s.status === 'warning').length,
    offline: configuredServices.value.filter(s => s.status === 'offline').length
  }))

  const togglePin = (id: string) => {
    const service = services.value.find(s => s.id === id)
    if (service) service.pinned = !service.pinned
  }

  return { services, configuredServices, summary, configuredIds, togglePin }
})

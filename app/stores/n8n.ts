import { createN8nService, type N8nWorkflow, type N8nExecution } from '~/services/n8n'

export const useN8nStore = defineStore('n8n', () => {
  const { baseUrl, apiKey, isConfigured: baseConfigured } = useIntegrationConfig('n8n')

  const loading = ref(true)
  const workflows = ref<N8nWorkflow[]>([])
  const executions = ref<N8nExecution[]>([])
  const status = ref<'online' | 'offline' | 'loading'>('loading')
  const error = ref<string | null>(null)

  const isConfigured = computed(() => baseConfigured.value && !!apiKey.value)

  const activeCount = computed(() => workflows.value.filter(w => w.active).length)

  const since7d = () => Date.now() - 7 * 24 * 60 * 60 * 1000

  const runs7d = computed(() =>
    executions.value.filter(e => new Date(e.startedAt).getTime() >= since7d()).length
  )

  const errorCount = computed(() =>
    executions.value.filter(e =>
      (e.status === 'error' || e.status === 'crashed')
      && new Date(e.startedAt).getTime() >= since7d()
    ).length
  )

  const lastRunByWorkflow = computed(() => {
    const map = new Map<string, Date>()
    for (const e of executions.value) {
      const existing = map.get(e.workflowId)
      const date = new Date(e.startedAt)
      if (!existing || date > existing) map.set(e.workflowId, date)
    }
    return map
  })

  const errorsByWorkflow = computed(() => {
    const map = new Map<string, number>()
    for (const e of executions.value) {
      if (e.status === 'error' || e.status === 'crashed') {
        map.set(e.workflowId, (map.get(e.workflowId) ?? 0) + 1)
      }
    }
    return map
  })

  const subtitle = computed(() => {
    if (!isConfigured.value) return 'Not configured'
    if (status.value === 'loading') return null
    if (status.value === 'offline') return 'Unreachable'
    return `${workflows.value.length} workflows · ${activeCount.value} active`
  })

  const stats = computed(() => [
    { label: 'Workflows', value: status.value === 'loading' ? null : String(workflows.value.length) },
    { label: 'Errors', value: status.value === 'loading' ? null : String(errorCount.value) }
  ])

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
      const service = createN8nService(url, key)
      const [workflowsRes, executionsRes] = await Promise.all([
        service.fetchWorkflows(),
        service.fetchExecutions()
      ])
      workflows.value = workflowsRes.data
      executions.value = executionsRes.data
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
    workflows,
    executions,
    status,
    error,
    isConfigured,
    activeCount,
    runs7d,
    errorCount,
    lastRunByWorkflow,
    errorsByWorkflow,
    subtitle,
    stats,
    refresh
  }
})

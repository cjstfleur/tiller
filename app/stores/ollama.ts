import { createOllamaService, type OllamaModel } from '~/services/ollama'

export const useOllamaStore = defineStore('ollama', () => {
  const { baseUrl, isConfigured } = useIntegrationConfig('ollama')

  const loading = ref(true)
  const models = ref<OllamaModel[]>([])
  const status = ref<'online' | 'offline' | 'loading'>('loading')

  // Source of truth for active model is the chat store's selection.
  // Fall back to first loaded model if nothing is selected yet.
  const activeModel = computed(() => {
    const chat = useChatStore()
    return chat.currentModel || models.value[0]?.name || null
  })

  const subtitle = computed(() => {
    if (!isConfigured.value) return 'Not configured'
    if (status.value === 'loading') return null
    if (status.value === 'offline') return 'Unreachable'
    if (!activeModel.value) return `${models.value.length} models`
    return `${activeModel.value} · ${models.value.length} models`
  })

  const totalSize = computed(() => {
    const bytes = models.value.reduce((sum, m) => sum + m.size, 0)
    return `${(bytes / (1024 ** 3)).toFixed(1)} GB`
  })

  const familiesCount = computed(() =>
    new Set(models.value.map(m => m.details.family)).size
  )

  const stats = computed(() => [
    { label: 'Models', value: status.value === 'loading' ? null : String(models.value.length) },
    { label: 'Status', value: status.value === 'loading' ? null : status.value }
  ])

  const refresh = async () => {
    const url = baseUrl.value
    if (!url) {
      loading.value = false
      status.value = 'offline'
      return
    }

    status.value = 'loading'
    try {
      const ollama = createOllamaService(url)
      const data = await ollama.listModels()
      models.value = data.models
      status.value = 'online'
    } catch {
      status.value = 'offline'
    } finally {
      loading.value = false
    }
  }

  watch(baseUrl, (url) => {
    if (url) refresh()
    else {
      loading.value = false
      status.value = 'offline'
    }
  }, { immediate: true })

  return { loading, models, status, activeModel, subtitle, stats, totalSize, familiesCount, isConfigured, refresh }
})

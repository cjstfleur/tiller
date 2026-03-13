export type IntegrationId = 'ollama' | 'uptimeKuma' | 'pihole' | 'n8n' | 'npm'

interface IntegrationEntry {
  baseUrl: string | null
  username: string | null
  apiKey: string | null
}

type IntegrationMap = Record<string, IntegrationEntry>

const useIntegrationsState = () =>
  useState<IntegrationMap | null>('integrations-config', () => null)

export async function loadIntegrations() {
  const state = useIntegrationsState()
  if (state.value) return
  state.value = await $fetch<IntegrationMap>('/api/integrations')
}

export async function saveIntegrations(updates: Partial<Record<IntegrationId, Partial<IntegrationEntry>>>) {
  await $fetch('/api/integrations', { method: 'PUT', body: updates })
  const state = useIntegrationsState()
  if (state.value) {
    for (const [id, config] of Object.entries(updates)) {
      state.value[id] = { ...state.value[id], ...config } as IntegrationEntry
    }
  } else {
    state.value = await $fetch<IntegrationMap>('/api/integrations')
  }
}

export function useIntegrationConfig(id: IntegrationId) {
  const state = useIntegrationsState()

  const baseUrl = computed(() => state.value?.[id]?.baseUrl ?? null)
  const apiKey = computed(() => state.value?.[id]?.apiKey ?? null)
  const username = computed(() => state.value?.[id]?.username ?? null)

  onMounted(async () => {
    if (!state.value) {
      state.value = await $fetch<IntegrationMap>('/api/integrations')
    }
  })

  return {
    baseUrl: readonly(baseUrl),
    apiKey: readonly(apiKey),
    username: readonly(username),
    isConfigured: computed(() => !!baseUrl.value)
  }
}

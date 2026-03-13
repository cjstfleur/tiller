export const useSettingsStore = defineStore('settings', () => {
  const refreshInterval = ref('60s')
  const theme = ref('system')
  const loaded = ref(false)

  const load = async () => {
    const data = await $fetch<{ refreshInterval: string, theme: string }>('/api/settings')
    refreshInterval.value = data.refreshInterval
    theme.value = data.theme
    loaded.value = true
  }

  const save = async (updates: Partial<{ refreshInterval: string, theme: string }>) => {
    if (updates.refreshInterval !== undefined) refreshInterval.value = updates.refreshInterval
    if (updates.theme !== undefined) theme.value = updates.theme
    await $fetch('/api/settings', { method: 'PUT', body: updates })
  }

  return { refreshInterval, theme, loaded, load, save }
})

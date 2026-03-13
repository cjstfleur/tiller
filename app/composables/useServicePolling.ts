function parseInterval(val: string): number {
  if (val.endsWith('m')) return parseInt(val) * 60 * 1000
  return parseInt(val) * 1000
}

export function useServicePolling() {
  const settings = useSettingsStore()
  const ollama = useOllamaStore()
  const uptimeKuma = useUptimeKumaStore()
  const pihole = usePiholeStore()
  const n8n = useN8nStore()
  const npm = useNpmStore()

  let timer: ReturnType<typeof setInterval> | null = null

  function stopPolling() {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  function startPolling(ms: number) {
    stopPolling()
    timer = setInterval(() => {
      Promise.allSettled([
        ollama.refresh(),
        uptimeKuma.refresh(),
        pihole.refresh(),
        n8n.refresh(),
        npm.refresh()
      ])
    }, ms)
  }

  watch(
    () => settings.refreshInterval,
    val => startPolling(parseInterval(val)),
    { immediate: true }
  )

  onUnmounted(stopPolling)
}

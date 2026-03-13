import { useOllamaStore } from '~/stores/ollama'
import { useUptimeKumaStore } from '~/stores/uptimeKuma'
import { useN8nStore } from '~/stores/n8n'
import { usePiholeStore } from '~/stores/pihole'

function buildOllamaSection(store: ReturnType<typeof useOllamaStore>): string {
  const lines = [
    '## Ollama',
    `Active model: ${store.activeModel ?? 'none'}`,
    `Available models: ${store.models.map(m => m.name).join(', ')}`,
    `Total size: ${store.totalSize}`
  ]
  return lines.join('\n')
}

function buildN8nSection(store: ReturnType<typeof useN8nStore>): string {
  const lines = [
    '## n8n',
    `Workflows: ${store.workflows.length} total, ${store.activeCount} active`,
    `Last 7 days: ${store.runs7d} runs, ${store.errorCount} errors`,
    '',
    '| Workflow | Active | Last Run | Errors (7d) |',
    '|----------|--------|----------|-------------|',
    ...store.workflows.map((w) => {
      const active = w.active ? 'Yes' : 'No'
      const lastRun = store.lastRunByWorkflow.get(w.id)
      const lastRunStr = lastRun ? lastRun.toLocaleString() : 'Never'
      const errors = store.errorsByWorkflow.get(w.id) ?? 0
      return `| ${w.name} | ${active} | ${lastRunStr} | ${errors} |`
    })
  ]
  return lines.join('\n')
}

function buildUptimeKumaSection(store: ReturnType<typeof useUptimeKumaStore>): string {
  const lines = [
    '## Uptime Kuma',
    `Overall: ${store.onlineCount} / ${store.totalCount} monitors online`,
    store.overallUptime !== null ? `Average 24h uptime: ${store.overallUptime}%` : '',
    store.avgPing !== null ? `Average response time: ${store.avgPing}ms` : '',
    '',
    '| Monitor | Status | 24h Uptime | Avg Ping |',
    '|---------|--------|------------|----------|',
    ...store.monitors.map((m) => {
      const status = m.lastStatus === 1 ? 'UP' : 'DOWN'
      const uptime = m.uptime24h !== null ? `${m.uptime24h.toFixed(1)}%` : '—'
      const ping = m.avgPing !== null ? `${m.avgPing}ms` : '—'
      return `| ${m.name} | ${status} | ${uptime} | ${ping} |`
    })
  ]
  return lines.filter(l => l !== '').join('\n')
}

function buildPiholeSection(store: ReturnType<typeof usePiholeStore>): string {
  const lines = [
    '## Pi-hole',
    `Queries today: ${store.queriesTotal.toLocaleString()}`,
    `Blocked: ${store.queriesBlocked.toLocaleString()} (${store.blockRate.toFixed(1)}%)`,
    `Domains on blocklist: ${store.domainsBlocked.toLocaleString()}`
  ]
  if (store.topBlocked.length) {
    lines.push('', 'Top blocked domains:')
    for (const entry of store.topBlocked) {
      lines.push(`- ${entry.domain}: ${entry.count}`)
    }
  }
  return lines.join('\n')
}

export function useSystemContext() {
  const buildSystemPrompt = (): string => {
    const sections: string[] = []
    const ollamaStore = useOllamaStore()
    const uptimeKumaStore = useUptimeKumaStore()

    sections.push(
      `You are Tiller, a homelab assistant. You help the user understand and manage their self-hosted services. Today is ${new Date().toLocaleString()}.`
    )

    if (ollamaStore.status === 'online' && ollamaStore.models.length > 0) {
      sections.push(buildOllamaSection(ollamaStore))
    }

    if (uptimeKumaStore.isConfigured && uptimeKumaStore.status === 'online' && uptimeKumaStore.monitors.length > 0) {
      sections.push(buildUptimeKumaSection(uptimeKumaStore))
    }

    const n8nStore = useN8nStore()
    if (n8nStore.isConfigured && n8nStore.status === 'online' && n8nStore.workflows.length > 0) {
      sections.push(buildN8nSection(n8nStore))
    }

    const piholeStore = usePiholeStore()
    if (piholeStore.isConfigured && piholeStore.status === 'online') {
      sections.push(buildPiholeSection(piholeStore))
    }

    return sections.join('\n\n')
  }

  return { buildSystemPrompt }
}

export interface UptimeKumaMonitor {
  id: number
  name: string
  url: string
  hostname: string
  active: boolean
  uptime24h: number | null
  avgPing: number | null
  lastStatus: 0 | 1 | 2 | 3
}

function parsePrometheusMetrics(text: string): UptimeKumaMonitor[] {
  const monitors: Record<string, UptimeKumaMonitor> = {}

  for (const line of text.split('\n')) {
    if (line.startsWith('#') || !line.trim()) continue

    const match = line.match(/^(\w+)\{([^}]+)\}\s+([\d.NaE+-]+)/)
    if (!match) continue

    const metricName = match[1]!
    const labelsStr = match[2]!
    const value = parseFloat(match[3]!)
    if (isNaN(value)) continue

    const labels: Record<string, string> = {}
    for (const m of labelsStr.matchAll(/(\w+)="([^"]*)"/g)) {
      labels[m[1]!] = m[2]!
    }

    const id = labels['monitor_id']
    if (!id) continue

    if (!monitors[id]) {
      monitors[id] = {
        id: parseInt(id),
        name: labels['monitor_name'] ?? '',
        url: labels['monitor_url'] ?? '',
        hostname: labels['monitor_hostname'] ?? '',
        active: false,
        uptime24h: null,
        avgPing: null,
        lastStatus: 0
      }
    }

    const mon = monitors[id]!
    if (metricName === 'monitor_status') {
      mon.lastStatus = value === 1 ? 1 : 0
      mon.active = value === 1
    } else if (metricName === 'monitor_response_time' && value > 0) {
      mon.avgPing = Math.round(value)
    } else if (metricName === 'monitor_uptime_ratio' && labels['window'] === '1d') {
      mon.uptime24h = Math.round(value * 1000) / 10
    }
  }

  return Object.values(monitors)
}

// _baseUrl and _apiKey are kept for signature compatibility but unused —
// auth is forwarded by the server-side proxy at /api/proxy/uptimeKuma
export function createUptimeKumaService(_baseUrl: string, _apiKey: string) {
  const fetchMonitors = async (): Promise<UptimeKumaMonitor[]> => {
    const text = await $fetch<string>('/api/proxy/uptimeKuma/metrics', { responseType: 'text' })
    return parsePrometheusMetrics(text)
  }

  return { fetchMonitors }
}

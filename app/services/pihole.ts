export interface PiholeSummary {
  queries: {
    total: number
    blocked: number
    percent_blocked: number
  }
  gravity: {
    domains_being_blocked: number
  }
}

export interface PiholeTopBlockedEntry {
  domain: string
  count: number
}

// _baseUrl and _password are kept for signature compatibility but unused —
// auth (SID lifecycle) is managed by the server-side proxy at /api/proxy/pihole
export function createPiholeService(_baseUrl: string, _password: string) {
  return {
    fetchSummary: () =>
      $fetch<PiholeSummary>('/api/proxy/pihole/api/stats/summary'),
    fetchTopBlocked: async (count = 5) => {
      const res = await $fetch<{ domains: Array<{ domain: string, count: number }> | null }>(
        '/api/proxy/pihole/api/stats/top_domains',
        { query: { count, blocked: true } }
      )
      return (res.domains ?? []).map(({ domain, count }) => ({ domain, count }))
    }
  }
}

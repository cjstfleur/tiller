export interface N8nWorkflow {
  id: string
  name: string
  active: boolean
}

export interface N8nExecution {
  id: string
  status: 'success' | 'error' | 'crashed' | 'waiting' | 'running'
  workflowId: string
  startedAt: string
  stoppedAt: string | null
}

// _baseUrl and _apiKey are kept for signature compatibility but unused —
// auth is injected by the server-side proxy at /api/proxy/n8n
export function createN8nService(_baseUrl: string, _apiKey: string) {
  const fetchWorkflows = (): Promise<{ data: N8nWorkflow[] }> =>
    $fetch('/api/proxy/n8n/api/v1/workflows')

  const fetchExecutions = (): Promise<{ data: N8nExecution[] }> =>
    $fetch('/api/proxy/n8n/api/v1/executions?limit=200')

  return { fetchWorkflows, fetchExecutions }
}

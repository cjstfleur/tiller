export interface OllamaModel {
  name: string
  model: string
  modified_at: string
  size: number
  digest: string
  details: {
    format: string
    family: string
    parameter_size: string
    quantization_level: string
  }
}

export interface OllamaTagsResponse {
  models: OllamaModel[]
}

export interface OllamaChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface OllamaChatRequest {
  model: string
  messages: OllamaChatMessage[]
  stream: boolean
}

export interface OllamaChatChunk {
  model: string
  created_at: string
  message: OllamaChatMessage
  done: boolean
  done_reason?: string
}

// _baseUrl is kept for signature compatibility with stores but is unused —
// all requests go through the server-side proxy at /api/proxy/ollama
export function createOllamaService(_baseUrl?: string) {
  const listModels = () => $fetch<OllamaTagsResponse>('/api/proxy/ollama/api/tags')

  const chat = async (request: OllamaChatRequest, onChunk: (chunk: OllamaChatChunk) => void): Promise<void> => {
    const response = await fetch('/api/proxy/ollama/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, stream: true })
    })

    if (!response.ok || !response.body) {
      throw new Error(`Ollama chat failed: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value, { stream: true })
      for (const line of text.split('\n').filter(Boolean)) {
        try {
          onChunk(JSON.parse(line))
        } catch {
          // partial line — will complete in next chunk
        }
      }
    }
  }

  return { listModels, chat }
}

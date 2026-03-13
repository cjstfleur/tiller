import { createOllamaService, type OllamaChatMessage } from '~/services/ollama'
import { useSystemContext } from '~/composables/useSystemContext'

const MODEL_KEY = 'tiller:chat:currentModel'

type ChatMessage = { id: string, role: string, parts: { type: string, text: string }[] }

export const useChatStore = defineStore('chat', () => {
  const { isConfigured } = useIntegrationConfig('ollama')
  const { buildSystemPrompt } = useSystemContext()

  const availableModels = ref<string[]>([])

  const storedModel = import.meta.client ? localStorage.getItem(MODEL_KEY) : null
  const currentModel = ref(storedModel ?? '')

  const messages = ref<ChatMessage[]>([])
  const status = ref<'ready' | 'streaming' | 'submitted'>('ready')
  const error = ref<string | null>(null)

  watch(currentModel, (val) => {
    if (import.meta.client) localStorage.setItem(MODEL_KEY, val)
  })

  const loadMessages = async () => {
    try {
      const data = await $fetch<ChatMessage[]>('/api/chat/messages')
      messages.value = data
    } catch {
      messages.value = []
    }
  }

  const loadModels = async () => {
    if (!isConfigured.value) return
    try {
      const ollama = createOllamaService()
      const { models } = await ollama.listModels()
      availableModels.value = models.map(m => m.name)
      if (!currentModel.value && availableModels.value.length > 0) {
        currentModel.value = availableModels.value[0]!
      }
    } catch {
      // Ollama unreachable — leave availableModels empty
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || !isConfigured.value) return

    error.value = null

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ type: 'text', text }]
    }
    messages.value.push(userMsg)

    const assistantId = (Date.now() + 1).toString()
    messages.value.push({
      id: assistantId,
      role: 'assistant',
      parts: [{ type: 'text', text: '' }]
    })

    status.value = 'streaming'

    const systemMessage: OllamaChatMessage = {
      role: 'system',
      content: buildSystemPrompt()
    }

    const history: OllamaChatMessage[] = [
      systemMessage,
      ...messages.value
        .filter(m => m.id !== assistantId)
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.parts.find(p => p.type === 'text')?.text ?? ''
        }))
    ]

    try {
      const ollama = createOllamaService()
      await ollama.chat(
        { model: currentModel.value, messages: history, stream: true },
        (chunk) => {
          const msgIdx = messages.value.findIndex(m => m.id === assistantId)
          if (msgIdx === -1) return
          const msg = messages.value[msgIdx]
          if (!msg) return
          const partIdx = msg.parts.findIndex(p => p.type === 'text')
          if (partIdx === -1) return
          const part = msg.parts[partIdx]
          if (!part) return
          part.text += chunk.message.content
        }
      )

      // Persist both messages to DB after successful completion
      const assistantMsg = messages.value.find(m => m.id === assistantId)
      await $fetch('/api/chat/messages', {
        method: 'POST',
        body: { id: userMsg.id, role: 'user', parts: userMsg.parts, model: currentModel.value }
      })
      if (assistantMsg) {
        await $fetch('/api/chat/messages', {
          method: 'POST',
          body: { id: assistantId, role: 'assistant', parts: assistantMsg.parts, model: currentModel.value }
        })
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to reach Ollama'
      messages.value = messages.value.filter(m => m.id !== assistantId)
    } finally {
      status.value = 'ready'
    }
  }

  const clearMessages = async () => {
    messages.value = []
    await $fetch('/api/chat/messages', { method: 'DELETE' })
  }

  watch(isConfigured, (configured) => {
    if (configured) loadModels()
  }, { immediate: true })

  return { availableModels, currentModel, status, error, messages, sendMessage, loadModels, loadMessages, clearMessages }
})

<script setup lang="ts">
const { setHeader } = useAppHeader()
const chat = useChatStore()

const modelDrawerOpen = ref(false)

watchEffect(() => {
  setHeader({
    title: 'Chat',
    subtitle: chat.currentModel || undefined,
    subtitleStatus: chat.currentModel ? 'online' : undefined,
    actions: [
      {
        icon: 'i-lucide-trash-2',
        onClick: () => chat.clearMessages()
      },
      {
        label: chat.currentModel || 'Select model',
        trailingIcon: 'i-lucide-chevron-down',
        onClick: () => { modelDrawerOpen.value = true }
      }
    ]
  })
})

const modelOptions = computed(() =>
  chat.availableModels.map(m => ({ label: m, value: m }))
)

const input = ref('')
</script>

<template>
  <div>
    <div class="h-full flex flex-col">
      <div class="flex-1 min-h-0 overflow-y-auto">
        <UChatMessages
          :messages="chat.messages"
          :status="chat.status"
        >
          <template #content="{ message }">
            <p class="whitespace-pre-wrap">
              {{ message.parts.find((p: { type: string }) => p.type === 'text')?.text }}
            </p>
          </template>
        </UChatMessages>
      </div>

      <div
        v-if="chat.error"
        class="mx-4 mb-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2"
      >
        <UIcon
          name="i-lucide-alert-circle"
          class="size-4 text-red-400 shrink-0"
        />
        <p class="text-xs text-red-400 flex-1">
          {{ chat.error }}
        </p>
      </div>

      <div class="shrink-0 border-t border-default px-4 pb-4 pt-2">
        <UChatPrompt
          v-model="input"
          placeholder="Message Ollama..."
          @submit="chat.sendMessage(input); input = ''"
        >
          <UChatPromptSubmit :status="chat.status" />
        </UChatPrompt>
      </div>
    </div>

    <SettingsOptionDrawer
      v-model:open="modelDrawerOpen"
      v-model="chat.currentModel"
      title="Select Model"
      :options="modelOptions"
    />
  </div>
</template>

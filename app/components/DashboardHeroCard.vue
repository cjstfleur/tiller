<script setup lang="ts">
import type { Service } from '~/stores/services'

defineProps<{ service: Service }>()
const router = useRouter()
const chat = useChatStore()
const ollama = useOllamaStore()

const input = ref('')

const submit = () => {
  const text = input.value.trim()
  if (!text) return
  chat.sendMessage(text)
  input.value = ''
  router.push('/chat')
}
</script>

<template>
  <div class="bg-elevated rounded-xl p-4 flex flex-col gap-4">
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-center gap-3 min-w-0">
        <div class="size-11 rounded-xl bg-accented border border-default flex items-center justify-center shrink-0">
          <UIcon
            :name="service.icon"
            class="size-6 text-highlighted"
          />
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-highlighted leading-tight">
            {{ service.name }}
          </p>
          <p class="text-xs text-muted flex items-center gap-1 mt-0.5">
            <span
              class="inline-block size-1.5 rounded-full shrink-0"
              :class="ollama.status === 'online' ? 'bg-green-400' : 'bg-red-400'"
            />
            {{ ollama.status === 'loading' ? 'Connecting…' : ollama.status === 'online' ? 'Running' : 'Offline' }}
          </p>
        </div>
      </div>
      <UBadge
        label="ACTIVE"
        color="primary"
        variant="solid"
        size="sm"
        class="shrink-0 mt-0.5"
      />
    </div>

    <div class="bg-accented rounded-xl px-3 py-2.5">
      <p class="text-xs text-muted tracking-widest uppercase mb-1.5">
        Active Model
      </p>
      <div class="flex items-baseline justify-between gap-2">
        <USkeleton
          v-if="ollama.loading"
          class="h-5 w-32"
        />
        <span
          v-else
          class="text-primary font-semibold text-base"
        >{{ ollama.activeModel ?? '—' }}</span>
        <USkeleton
          v-if="ollama.loading"
          class="h-4 w-16"
        />
        <span
          v-else
          class="text-xs text-muted shrink-0"
        >{{ ollama.models.length ? `${ollama.models.length} models` : '' }}</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <div
        v-for="stat in ollama.stats"
        :key="stat.label"
        class="bg-accented rounded-lg px-3 py-2.5"
      >
        <p class="text-xs text-muted">
          {{ stat.label }}
        </p>
        <USkeleton
          v-if="ollama.loading"
          class="h-4 w-10 mt-1"
        />
        <p
          v-else
          class="text-sm font-semibold text-highlighted mt-0.5"
        >
          {{ stat.value ?? '—' }}
        </p>
      </div>
    </div>

    <form
      class="flex items-center gap-2 bg-accented rounded-xl px-4 py-2.5"
      @submit.prevent="submit"
    >
      <input
        v-model="input"
        type="text"
        :placeholder="`Ask ${service.name} anything…`"
        class="flex-1 bg-transparent text-sm text-highlighted placeholder:text-muted outline-none min-w-0"
      >
      <UButton
        type="submit"
        icon="i-lucide-arrow-up"
        color="primary"
        size="sm"
        :disabled="!input.trim()"
      />
    </form>
  </div>
</template>

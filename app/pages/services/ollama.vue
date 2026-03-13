<script setup lang="ts">
definePageMeta({ layout: 'detail' })

const router = useRouter()
const ollama = useOllamaStore()
const { baseUrl } = useIntegrationConfig('ollama')

const formatSize = (bytes: number) => {
  const gb = bytes / (1024 ** 3)
  return `${gb.toFixed(1)} GB`
}

const activeModelObj = computed(() =>
  ollama.models.find(m => m.name === ollama.activeModel) ?? ollama.models[0] ?? null
)

const configModalOpen = ref(false)
</script>

<template>
  <div class="flex flex-col min-h-full">
    <!-- Header -->
    <header class="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <UButton
          icon="i-lucide-chevron-left"
          variant="ghost"
          color="neutral"
          size="sm"
          class="-ml-2 shrink-0"
          @click="router.back()"
        />
        <div class="min-w-0">
          <h1 class="text-xl font-bold text-highlighted leading-tight">
            Ollama
          </h1>
          <p class="text-xs text-muted truncate">
            {{ baseUrl }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <UBadge
          :label="ollama.status === 'online' ? 'RUNNING' : ollama.status === 'loading' ? 'CONNECTING' : 'OFFLINE'"
          :color="ollama.status === 'online' ? 'primary' : 'neutral'"
          variant="subtle"
        />
        <UButton
          icon="i-lucide-settings-2"
          variant="ghost"
          color="neutral"
          size="sm"
          @click="configModalOpen = true"
        />
      </div>
    </header>

    <IntegrationConfigModal
      v-model:open="configModalOpen"
      integration-id="ollama"
      name="Ollama"
    />

    <div class="flex flex-col gap-4 px-4 pb-6">
      <!-- Active Model -->
      <div class="bg-elevated rounded-xl px-4 py-3.5">
        <p class="text-xs text-muted tracking-widest uppercase mb-2">
          Active Model
        </p>
        <div class="flex items-baseline justify-between gap-2">
          <USkeleton
            v-if="ollama.loading"
            class="h-7 w-36"
          />
          <span
            v-else
            class="text-2xl font-bold text-primary"
          >{{ activeModelObj?.name ?? '—' }}</span>
          <USkeleton
            v-if="ollama.loading"
            class="h-4 w-20"
          />
          <span
            v-else-if="activeModelObj"
            class="text-xs text-muted shrink-0"
          >{{ formatSize(activeModelObj.size) }} VRAM</span>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-2">
        <div
          v-for="stat in [
            { label: 'Models', value: String(ollama.models.length || '—') },
            { label: 'Total Size', value: ollama.totalSize },
            { label: 'Families', value: String(ollama.familiesCount || '—') }
          ]"
          :key="stat.label"
          class="bg-elevated rounded-xl px-3 py-3"
        >
          <p class="text-xs text-muted">
            {{ stat.label }}
          </p>
          <USkeleton
            v-if="ollama.loading"
            class="h-6 w-10 mt-1"
          />
          <p
            v-else
            class="text-xl font-bold text-highlighted mt-0.5"
          >
            {{ stat.value }}
          </p>
        </div>
      </div>

      <!-- Loaded Models list -->
      <div class="bg-elevated rounded-xl overflow-hidden">
        <p class="text-sm font-bold text-highlighted px-4 pt-3.5 pb-2.5">
          Loaded Models
        </p>
        <div
          v-if="ollama.loading"
          class="divide-y divide-default border-t border-default"
        >
          <div
            v-for="i in 3"
            :key="i"
            class="px-4 py-3"
          >
            <USkeleton class="h-4 w-32" />
          </div>
        </div>
        <div
          v-else-if="ollama.models.length"
          class="divide-y divide-default border-t border-default"
        >
          <div
            v-for="model in ollama.models"
            :key="model.name"
            class="flex items-center justify-between gap-3 px-4 py-3"
          >
            <span class="text-sm font-mono text-highlighted truncate">{{ model.name }}</span>
            <div class="flex items-center gap-2 shrink-0">
              <UBadge
                v-if="model.name === ollama.activeModel"
                label="ACTIVE"
                color="primary"
                variant="subtle"
                size="sm"
              />
              <span class="text-xs text-muted">{{ formatSize(model.size) }}</span>
            </div>
          </div>
        </div>
        <div
          v-else
          class="px-4 py-6 text-center border-t border-default"
        >
          <p class="text-sm text-muted">
            No models loaded
          </p>
        </div>
      </div>
    </div>

    <!-- Open Chat button -->
    <div class="mt-auto px-4 pb-4">
      <UButton
        label="Open Chat →"
        color="primary"
        block
        size="lg"
        @click="router.push('/chat')"
      />
    </div>
  </div>
</template>

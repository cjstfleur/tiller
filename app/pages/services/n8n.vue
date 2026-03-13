<script setup lang="ts">
definePageMeta({ layout: 'detail' })

const router = useRouter()
const store = useN8nStore()
const { baseUrl } = useIntegrationConfig('n8n')

const badgeColor = computed(() => {
  if (store.loading) return 'neutral'
  if (store.status === 'online') return 'success'
  return 'error'
})

const badgeLabel = computed(() => {
  if (store.loading) return '...'
  return store.status === 'online' ? 'ONLINE' : 'OFFLINE'
})

const workflowDotClass = (active: boolean, id: string): string => {
  const lastRun = store.lastRunByWorkflow.get(id)
  if (!lastRun) return 'bg-neutral-500'
  return active ? 'bg-green-400' : 'bg-orange-400'
}

const formatRelative = (date: Date | undefined): string => {
  if (!date) return 'Never'
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return `${Math.floor(diffDays / 7)}w ago`
}

const formatDuration = (startedAt: string, stoppedAt: string | null): string => {
  if (!stoppedAt) return '...'
  const ms = new Date(stoppedAt).getTime() - new Date(startedAt).getTime()
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

const recentExecutions = computed(() => store.executions.slice(0, 10))

const workflowNameById = computed(() => {
  const map = new Map<string, string>()
  for (const w of store.workflows) map.set(w.id, w.name)
  return map
})

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
            n8n
          </h1>
          <p class="text-xs text-muted truncate">
            {{ baseUrl }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <USkeleton
          v-if="store.loading"
          class="h-6 w-20"
        />
        <UBadge
          v-else
          :label="badgeLabel"
          :color="badgeColor"
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
      integration-id="n8n"
      name="n8n"
      needs-api-key
      api-key-label="API Key"
    />

    <div class="flex flex-col gap-4 px-4 pb-6">
      <!-- Stats row -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-elevated rounded-xl px-3 py-3">
          <p class="text-xs text-muted mb-1">
            Workflows
          </p>
          <USkeleton
            v-if="store.loading"
            class="h-7 w-10"
          />
          <p
            v-else
            class="text-2xl font-bold text-orange-400"
          >
            {{ store.workflows.length }}
          </p>
        </div>
        <div class="bg-elevated rounded-xl px-3 py-3">
          <p class="text-xs text-muted mb-1">
            Runs (7d)
          </p>
          <USkeleton
            v-if="store.loading"
            class="h-7 w-10"
          />
          <p
            v-else
            class="text-2xl font-bold text-green-400"
          >
            {{ store.runs7d }}
          </p>
        </div>
        <div class="bg-elevated rounded-xl px-3 py-3">
          <p class="text-xs text-muted mb-1">
            Errors (7d)
          </p>
          <USkeleton
            v-if="store.loading"
            class="h-7 w-10"
          />
          <p
            v-else
            class="text-2xl font-bold"
            :class="store.errorCount > 0 ? 'text-red-400' : 'text-highlighted'"
          >
            {{ store.errorCount }}
          </p>
        </div>
      </div>

      <!-- Workflows list -->
      <div class="bg-elevated rounded-xl overflow-hidden">
        <div class="flex items-center justify-between px-4 pt-3.5 pb-2.5">
          <p class="text-sm font-bold text-highlighted">
            Workflows
          </p>
          <p
            v-if="!store.loading"
            class="text-xs font-semibold text-orange-400"
          >
            {{ store.activeCount }} active
          </p>
        </div>

        <!-- Skeleton -->
        <div
          v-if="store.loading"
          class="divide-y divide-default border-t border-default"
        >
          <div
            v-for="i in 4"
            :key="i"
            class="flex items-center gap-3 px-4 py-3"
          >
            <USkeleton class="size-2 rounded-full shrink-0" />
            <div class="flex-1 flex flex-col gap-1.5">
              <USkeleton class="h-4 w-36" />
              <USkeleton class="h-3 w-24" />
            </div>
            <USkeleton class="h-4 w-8 shrink-0" />
          </div>
        </div>

        <!-- Workflow rows -->
        <div
          v-else-if="store.workflows.length"
          class="divide-y divide-default border-t border-default"
        >
          <div
            v-for="workflow in store.workflows"
            :key="workflow.id"
            class="flex items-center gap-3 px-4 py-3"
          >
            <span
              class="inline-block size-2 rounded-full shrink-0"
              :class="workflowDotClass(workflow.active, workflow.id)"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-highlighted truncate">
                {{ workflow.name }}
              </p>
              <p class="text-xs text-muted">
                Last run {{ formatRelative(store.lastRunByWorkflow.get(workflow.id)) }}
              </p>
            </div>
            <span
              v-if="store.errorsByWorkflow.get(workflow.id)"
              class="text-xs font-semibold text-red-400 shrink-0"
            >
              {{ store.errorsByWorkflow.get(workflow.id) }} err
            </span>
            <span
              v-else
              class="text-xs text-muted shrink-0"
            >
              —
            </span>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="px-4 py-6 text-center border-t border-default"
        >
          <p class="text-sm text-muted">
            No workflows found
          </p>
        </div>
      </div>

      <!-- Recent Executions -->
      <div class="bg-elevated rounded-xl overflow-hidden">
        <p class="text-sm font-bold text-highlighted px-4 pt-3.5 pb-2.5">
          Recent Executions
        </p>

        <!-- Skeleton -->
        <div
          v-if="store.loading"
          class="divide-y divide-default border-t border-default"
        >
          <div
            v-for="i in 4"
            :key="i"
            class="flex items-center gap-3 px-4 py-3"
          >
            <USkeleton class="size-4 rounded shrink-0" />
            <div class="flex-1 flex flex-col gap-1.5">
              <USkeleton class="h-4 w-40" />
              <USkeleton class="h-3 w-24" />
            </div>
          </div>
        </div>

        <!-- Execution rows -->
        <div
          v-else-if="recentExecutions.length"
          class="divide-y divide-default border-t border-default"
        >
          <div
            v-for="execution in recentExecutions"
            :key="execution.id"
            class="flex items-center gap-3 px-4 py-3"
          >
            <UIcon
              :name="execution.status === 'success' ? 'i-lucide-check' : 'i-lucide-x'"
              class="size-4 shrink-0"
              :class="execution.status === 'success' ? 'text-green-400' : 'text-red-400'"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-highlighted truncate">
                {{ workflowNameById.get(execution.workflowId) ?? execution.workflowId }}
              </p>
              <p class="text-xs text-muted">
                {{ formatRelative(new Date(execution.startedAt)) }} · {{ formatDuration(execution.startedAt, execution.stoppedAt) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="px-4 py-6 text-center border-t border-default"
        >
          <p class="text-sm text-muted">
            No recent executions
          </p>
        </div>
      </div>

      <!-- Error -->
      <div
        v-if="store.error"
        class="bg-elevated rounded-xl px-4 py-3.5"
      >
        <p class="text-sm text-red-400">
          {{ store.error }}
        </p>
      </div>
    </div>
  </div>
</template>

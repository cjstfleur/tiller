<script setup lang="ts">
definePageMeta({ layout: 'detail' })

const router = useRouter()
const store = useUptimeKumaStore()
const { baseUrl } = useIntegrationConfig('uptimeKuma')

const dotClass: Record<'green' | 'yellow' | 'red', string> = {
  green: 'bg-green-400',
  yellow: 'bg-yellow-400',
  red: 'bg-red-400'
}

const uptimeClass: Record<'green' | 'yellow' | 'red', string> = {
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  red: 'text-red-400'
}

const badgeColor = computed(() => {
  if (store.loading) return 'neutral'
  if (store.onlineCount === store.totalCount) return 'primary'
  if (store.onlineCount > 0) return 'warning'
  return 'error'
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
            Uptime Kuma
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
          :label="`${store.onlineCount}/${store.totalCount} online`"
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
      integration-id="uptimeKuma"
      name="Uptime Kuma"
      needs-api-key
      api-key-label="API Key"
    />

    <div class="flex flex-col gap-4 px-4 pb-6">
      <!-- Overall Health -->
      <div class="bg-elevated rounded-xl px-4 py-3.5">
        <p class="text-xs text-muted tracking-widest uppercase mb-2">
          Overall Health
        </p>
        <USkeleton
          v-if="store.loading"
          class="h-2 w-full rounded-full mb-2"
        />
        <div
          v-else
          class="w-full bg-accented rounded-full h-2 mb-2"
        >
          <div
            class="h-2 rounded-full bg-primary transition-all"
            :style="{ width: `${store.overallUptime ?? 0}%` }"
          />
        </div>
        <USkeleton
          v-if="store.loading"
          class="h-5 w-24"
        />
        <p
          v-else
          class="text-sm font-semibold text-highlighted"
        >
          {{ store.overallUptime !== null ? `${store.overallUptime}% up` : '—' }}
        </p>
      </div>

      <!-- Monitor List -->
      <div class="bg-elevated rounded-xl overflow-hidden">
        <p class="text-sm font-bold text-highlighted px-4 pt-3.5 pb-2.5">
          Monitors
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
            <USkeleton class="size-2 rounded-full shrink-0" />
            <div class="flex-1 flex flex-col gap-1.5">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-48" />
            </div>
            <div class="flex flex-col items-end gap-1.5 shrink-0">
              <USkeleton class="h-4 w-12" />
              <USkeleton class="h-3 w-10" />
            </div>
          </div>
        </div>

        <!-- Monitor rows -->
        <div
          v-else-if="store.monitors.length"
          class="divide-y divide-default border-t border-default"
        >
          <div
            v-for="monitor in store.monitors"
            :key="monitor.id"
            class="flex items-center gap-3 px-4 py-3"
          >
            <span
              class="inline-block size-2 rounded-full shrink-0"
              :class="dotClass[store.monitorStatus(monitor)]"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-highlighted truncate">
                {{ monitor.name }}
              </p>
              <p class="text-xs text-muted truncate">
                {{ monitor.url }}
              </p>
            </div>
            <div class="flex flex-col items-end shrink-0 gap-0.5">
              <span
                class="text-sm font-semibold"
                :class="uptimeClass[store.monitorStatus(monitor)]"
              >
                {{ monitor.uptime24h !== null ? `${monitor.uptime24h.toFixed(1)}%` : '—' }}
              </span>
              <span class="text-xs text-muted">
                {{ monitor.avgPing !== null ? `${monitor.avgPing}ms` : '—' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="px-4 py-6 text-center border-t border-default"
        >
          <p class="text-sm text-muted">
            No monitors found
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

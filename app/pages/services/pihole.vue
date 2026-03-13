<script setup lang="ts">
definePageMeta({ layout: 'detail' })

const router = useRouter()
const store = usePiholeStore()
const { baseUrl } = useIntegrationConfig('pihole')

const badgeColor = computed(() => {
  if (store.loading) return 'neutral'
  if (store.status === 'online') return 'success'
  return 'error'
})

const badgeLabel = computed(() => {
  if (store.loading) return '...'
  return store.status === 'online' ? 'Active' : 'Offline'
})

const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

const maxTopCount = computed(() =>
  store.topBlocked[0]?.count ?? 1
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
            Pi-hole
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
      integration-id="pihole"
      name="Pi-hole"
      needs-api-key
      api-key-label="App Password"
    />

    <div class="flex flex-col gap-4 px-4 pb-6">
      <!-- Stats grid (2x2) -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-elevated rounded-xl px-3 py-3">
          <p class="text-xs text-muted mb-1 uppercase tracking-wide">
            Queries Today
          </p>
          <USkeleton
            v-if="store.loading"
            class="h-8 w-24"
          />
          <p
            v-else
            class="text-3xl font-bold text-teal-400"
          >
            {{ formatCount(store.queriesTotal) }}
          </p>
        </div>
        <div class="bg-elevated rounded-xl px-3 py-3">
          <p class="text-xs text-muted mb-1 uppercase tracking-wide">
            Blocked
          </p>
          <USkeleton
            v-if="store.loading"
            class="h-8 w-24"
          />
          <p
            v-else
            class="text-3xl font-bold text-purple-400"
          >
            {{ formatCount(store.queriesBlocked) }}
          </p>
        </div>
        <div class="bg-elevated rounded-xl px-3 py-3">
          <p class="text-xs text-muted mb-1 uppercase tracking-wide">
            Block Rate
          </p>
          <USkeleton
            v-if="store.loading"
            class="h-8 w-20"
          />
          <p
            v-else
            class="text-3xl font-bold text-orange-400"
          >
            {{ store.blockRate.toFixed(1) }}%
          </p>
        </div>
        <div class="bg-elevated rounded-xl px-3 py-3">
          <p class="text-xs text-muted mb-1 uppercase tracking-wide">
            Domains List
          </p>
          <USkeleton
            v-if="store.loading"
            class="h-8 w-24"
          />
          <p
            v-else
            class="text-3xl font-bold text-green-400"
          >
            {{ formatCount(store.domainsBlocked) }}
          </p>
        </div>
      </div>

      <!-- Top Blocked Domains -->
      <div class="bg-elevated rounded-xl overflow-hidden">
        <p class="text-sm font-bold text-highlighted px-4 pt-3.5 pb-2.5">
          Top Blocked Domains
        </p>

        <!-- Skeleton -->
        <div
          v-if="store.loading"
          class="divide-y divide-default border-t border-default"
        >
          <div
            v-for="i in 5"
            :key="i"
            class="px-4 py-3 flex flex-col gap-1.5"
          >
            <div class="flex justify-between">
              <USkeleton class="h-4 w-40" />
              <USkeleton class="h-4 w-10" />
            </div>
            <USkeleton class="h-0.5 w-full" />
          </div>
        </div>

        <!-- Domain rows -->
        <div
          v-else-if="store.topBlocked.length"
          class="divide-y divide-default border-t border-default"
        >
          <div
            v-for="entry in store.topBlocked"
            :key="entry.domain"
            class="px-4 py-3"
          >
            <div class="flex items-center justify-between mb-1.5">
              <p class="text-sm font-mono text-highlighted truncate mr-3">
                {{ entry.domain }}
              </p>
              <p class="text-sm font-semibold text-purple-400 shrink-0">
                {{ entry.count.toLocaleString() }}
              </p>
            </div>
            <div class="h-0.5 bg-muted rounded-full overflow-hidden">
              <div
                class="h-full bg-purple-500 rounded-full"
                :style="{ width: `${(entry.count / maxTopCount) * 100}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="px-4 py-6 text-center border-t border-default"
        >
          <p class="text-sm text-muted">
            No blocked domains found
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

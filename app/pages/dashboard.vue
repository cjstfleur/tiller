<script setup lang="ts">
const { setHeader } = useAppHeader()
const router = useRouter()
const store = useServicesStore()

const hour = new Date().getHours()
const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

setHeader({
  greeting,
  title: 'Your Stack',
  actions: [{ icon: 'i-lucide-settings', onClick: () => router.push('/settings') }]
})

const ollamaService = computed(() => store.configuredServices.find(s => s.id === 'ollama') ?? null)
const hasPinned = computed(() => store.configuredServices.some(s => s.pinned))
const gridServices = computed(() => store.configuredServices.filter(s => s.pinned && s.id !== 'ollama'))

const uptimeKuma = useUptimeKumaStore()
const n8n = useN8nStore()

const dotsForService = (serviceId: string): ('green' | 'yellow' | 'red')[] | undefined => {
  if (serviceId === 'uptime-kuma') {
    return uptimeKuma.monitors.map(m => uptimeKuma.monitorStatus(m))
  }
  if (serviceId === 'n8n') {
    return n8n.workflows.map((w) => {
      const lastExec = n8n.executions.find(e => e.workflowId === w.id)
      if (!lastExec) return 'yellow'
      if (lastExec.status === 'success') return 'green'
      if (lastExec.status === 'error' || lastExec.status === 'crashed') return 'red'
      return 'yellow'
    })
  }
  return undefined
}

type ActivityItem = { icon: string, label: string, time: string, color: string }
const activity: ActivityItem[] = [
  // { icon: 'i-simple-icons-ollama', label: 'Ollama completed chat request', time: '2m ago', color: 'blue' },
  // { icon: 'i-simple-icons-n8n', label: 'n8n: RSS → Summarize failed', time: '18m ago', color: 'orange' },
  // { icon: 'i-simple-icons-pihole', label: 'Pi-hole blocked 142 queries', time: '22m ago', color: 'purple' },
  // { icon: 'i-lucide-activity', label: 'All monitors healthy', time: '1h ago', color: 'green' }
].slice(0, 5)

const activityBgMap: Record<string, string> = {
  blue: 'bg-blue-500/15',
  orange: 'bg-orange-500/15',
  purple: 'bg-purple-500/15',
  green: 'bg-green-500/15'
}
</script>

<template>
  <div class="p-4 flex flex-col gap-6">
    <div
      v-if="!hasPinned"
      class="border-2 border-dashed border-default rounded-xl py-16 flex flex-col items-center gap-3"
    >
      <UIcon
        name="i-lucide-star"
        class="size-8 text-muted"
      />
      <div class="text-center">
        <p class="text-sm font-semibold text-highlighted">
          No pinned services
        </p>
        <p class="text-xs text-muted mt-1">
          Pin services from the Services tab to see them here
        </p>
      </div>
    </div>

    <DashboardHeroCard
      v-if="ollamaService?.pinned"
      :service="ollamaService"
    />

    <div
      v-if="gridServices.length"
      class="grid grid-cols-2 gap-3"
    >
      <DashboardMiniCard
        v-for="(service) in gridServices"
        :key="service.id"
        :service="service"
        :dots="dotsForService(service.id)"
      />
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between px-1">
        <p class="text-sm font-semibold text-highlighted">
          Recent Activity
        </p>
        <button class="text-sm text-primary">
          View all
        </button>
      </div>
      <div class="bg-elevated rounded-xl divide-y divide-default">
        <div
          v-for="item in activity"
          :key="item.label"
          class="flex items-center gap-3 px-4 py-3.5"
        >
          <div
            class="size-9 rounded-lg flex items-center justify-center shrink-0"
            :class="activityBgMap[item.color]"
          >
            <UIcon
              :name="item.icon"
              class="size-5 text-highlighted"
            />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm text-highlighted truncate">
              {{ item.label }}
            </p>
            <p class="text-xs text-muted mt-0.5">
              {{ item.time }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Service } from '~/stores/services'

const router = useRouter()

const props = defineProps<{
  service: Service
  loading?: boolean
  dots?: ('green' | 'yellow' | 'red')[]
}>()

const bgMap: Record<string, string> = {
  blue: 'bg-blue-500/15',
  green: 'bg-green-500/15',
  purple: 'bg-purple-500/15',
  orange: 'bg-orange-500/15'
}

const dotMap: Record<string, string> = {
  blue: 'bg-blue-400',
  green: 'bg-green-400',
  purple: 'bg-purple-400',
  orange: 'bg-orange-400'
}

const iconBgClass = computed(() => bgMap[props.service.accentColor] ?? 'bg-accented')
const dotClass = computed(() => dotMap[props.service.accentColor] ?? 'bg-muted')

const navigate = () => router.push(`/services/${props.service.id}`)
</script>

<template>
  <div
    class="bg-elevated rounded-xl p-3.5 flex flex-col gap-2.5"
    @click="navigate"
  >
    <div class="flex items-center gap-2">
      <div
        class="size-7 rounded-lg border border-default flex items-center justify-center shrink-0"
        :class="iconBgClass"
      >
        <UIcon
          :name="service.icon"
          class="size-4 text-highlighted"
        />
      </div>
      <p class="text-sm font-semibold text-highlighted flex-1 min-w-0 truncate">
        {{ service.name }}
      </p>
      <UBadge
        :label="service.badge.label"
        :color="service.badge.color as any"
        variant="subtle"
        size="sm"
        class="shrink-0"
      />
    </div>

    <USkeleton
      v-if="loading"
      class="h-3 w-3/4"
    />
    <p
      v-else
      class="text-xs text-muted truncate"
    >
      {{ service.subtitle }}
    </p>

    <div class="flex gap-1 flex-wrap">
      <!-- Per-monitor dots (e.g. Uptime Kuma) -->
      <template v-if="dots !== undefined">
        <span
          v-for="(color, i) in dots"
          :key="i"
          class="size-1.5 rounded-full"
          :class="color === 'green' ? 'bg-green-400' : color === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'"
        />
      </template>
      <!-- Generic status dots for other services -->
      <template v-else>
        <span
          v-for="i in 10"
          :key="i"
          class="size-1.5 rounded-full"
          :class="service.status === 'online' ? dotClass : service.status === 'warning' ? 'bg-orange-400' : 'bg-muted'"
        />
      </template>
    </div>
  </div>
</template>

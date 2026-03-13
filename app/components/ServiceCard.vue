<script setup lang="ts">
import type { Service } from '~/stores/services'

const props = defineProps<{ service: Service }>()
const store = useServicesStore()
const router = useRouter()

const accentBorderMap: Record<string, string> = {
  blue: 'border-l-blue-500',
  green: 'border-l-green-500',
  purple: 'border-l-purple-500',
  orange: 'border-l-orange-500'
}

const accentBorderClass = computed(() => accentBorderMap[props.service.accentColor] ?? 'border-l-default')

const statCells = computed(() => [
  ...props.service.stats.map(s => ({ label: s.label, value: s.value, valueClass: 'text-highlighted' }))
])

const navigate = () => router.push(`/services/${props.service.id}`)
</script>

<template>
  <div
    class="bg-elevated rounded-xl overflow-hidden border-l-4 cursor-pointer"
    :class="accentBorderClass"
    @click="navigate"
  >
    <div class="px-4 pt-3">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-3 min-w-0">
          <div class="size-9 rounded-lg bg-elevated border border-default flex items-center justify-center shrink-0">
            <UIcon
              :name="service.icon"
              class="size-5 text-highlighted"
            />
          </div>
          <div class="min-w-0">
            <p class="font-semibold text-sm text-highlighted leading-tight">
              {{ service.name }}
            </p>
            <p class="text-xs text-muted flex items-center gap-1 mt-0.5">
              <span
                class="inline-block size-1.5 rounded-full shrink-0"
                :class="service.status === 'online' ? 'bg-green-400' : service.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'"
              />
              <span class="truncate">{{ service.subtitle }}</span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <UBadge
            :label="service.badge.label"
            :color="service.badge.color as any"
            variant="subtle"
            size="sm"
          />
          <UButton
            :icon="service.pinned ? 'i-lucide-star' : 'i-lucide-star-off'"
            variant="ghost"
            color="neutral"
            size="xs"
            :class="service.pinned ? 'text-yellow-400' : 'text-muted'"
            @click.stop="store.togglePin(service.id)"
          />
          <UIcon
            name="i-lucide-chevron-right"
            class="size-4 text-muted"
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 divide-x divide-default border-t border-default mt-3">
      <div
        v-for="cell in statCells"
        :key="cell.label"
        class="px-3 py-2.5"
      >
        <p class="text-xs text-muted">
          {{ cell.label }}
        </p>
        <p
          class="text-sm font-semibold mt-0.5"
          :class="cell.valueClass"
        >
          {{ cell.value }}
        </p>
      </div>
    </div>
  </div>
</template>

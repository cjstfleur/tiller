<script setup lang="ts">
const route = useRoute()

const tabs = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
  { label: 'Chat', icon: 'i-lucide-message-circle', to: '/chat' },
  { label: 'Services', icon: 'i-lucide-server', to: '/services' },
  { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' }
]

const isActive = (to: string) =>
  route.path === to || (to !== '/dashboard' && route.path.startsWith(to))
</script>

<template>
  <nav class="lg:hidden shrink-0 border-t border-default bg-background">
    <div class="flex pb-2">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-semibold uppercase tracking-wider transition-colors"
        :class="isActive(tab.to) ? 'text-primary' : 'text-muted'"
      >
        <UIcon
          :name="tab.icon"
          class="size-5"
        />
        {{ tab.label }}
      </NuxtLink>
    </div>
  </nav>
</template>

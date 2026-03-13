<script setup lang="ts">
const route = useRoute()
const { logout } = useAuth()

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
  <nav class="hidden lg:flex flex-col w-56 shrink-0 h-dvh border-r border-default bg-background sticky top-0">
    <div class="px-4 py-5 border-b border-default flex items-center gap-2.5">
      <UIcon
        name="i-lucide-anchor"
        class="size-5 text-primary"
      />
      <span class="text-sm font-bold tracking-widest uppercase text-highlighted">Tiller</span>
    </div>

    <div class="flex flex-col gap-0.5 p-3 flex-1">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        :class="isActive(tab.to) ? 'bg-primary/10 text-primary' : 'text-muted hover:text-highlighted hover:bg-elevated'"
      >
        <UIcon
          :name="tab.icon"
          class="size-4.5 shrink-0"
        />
        {{ tab.label }}
      </NuxtLink>
    </div>

    <div class="p-3 border-t border-default">
      <button
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-highlighted hover:bg-elevated w-full transition-colors"
        @click="logout"
      >
        <UIcon
          name="i-lucide-log-out"
          class="size-4.5 shrink-0"
        />
        Sign out
      </button>
    </div>
  </nav>
</template>

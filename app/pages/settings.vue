<script setup lang="ts">
const { setHeader } = useAppHeader()
const settings = useSettingsStore()
const colorMode = useColorMode()
const { logout } = useAuth()

setHeader({ title: 'Settings' })

const openRefreshInterval = ref(false)
const openTheme = ref(false)

const intervalOptions = ['15s', '30s', '60s', '5m'].map(v => ({ label: v, value: v }))
const themeOptions = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' }
]

const themeLabel = computed(
  () => themeOptions.find(o => o.value === colorMode.preference)?.label ?? 'System'
)

// Persist to server when value changes
watch(() => settings.refreshInterval, val => settings.save({ refreshInterval: val }))
watch(() => colorMode.preference, val => settings.save({ theme: val }))

const prefs = computed(() => [
  {
    label: 'Refresh Interval',
    description: 'Dashboard polling rate',
    value: settings.refreshInterval,
    open: () => { openRefreshInterval.value = true }
  },
  {
    label: 'Theme',
    description: 'Appearance',
    value: themeLabel.value,
    open: () => { openTheme.value = true }
  }
])
</script>

<template>
  <div>
    <div class="p-4 flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <p class="text-xs font-semibold tracking-widest text-muted uppercase px-1">
          Preferences
        </p>
        <div class="bg-elevated rounded-xl divide-y divide-default">
          <button
            v-for="pref in prefs"
            :key="pref.label"
            class="flex items-center justify-between w-full px-4 py-3.5 text-left transition-colors active:bg-accented"
            @click="pref.open()"
          >
            <div>
              <p class="text-sm font-semibold text-highlighted">
                {{ pref.label }}
              </p>
              <p class="text-xs text-muted mt-0.5">
                {{ pref.description }}
              </p>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-sm font-medium text-primary">{{ pref.value }}</span>
              <UIcon
                name="i-lucide-chevron-right"
                class="size-4 text-muted"
              />
            </div>
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <p class="text-xs font-semibold tracking-widest text-muted uppercase px-1">
          Account
        </p>
        <div class="bg-elevated rounded-xl divide-y divide-default">
          <button
            class="flex items-center justify-between w-full px-4 py-3.5 text-left transition-colors active:bg-accented"
            @click="logout"
          >
            <div class="flex items-center gap-3">
              <UIcon
                name="i-lucide-log-out"
                class="size-4.5 text-muted"
              />
              <p class="text-sm font-semibold text-highlighted">
                Sign out
              </p>
            </div>
          </button>
        </div>
      </div>

      <div class="bg-elevated rounded-xl flex flex-col items-center gap-2 py-8 px-4">
        <UIcon
          name="i-lucide-anchor"
          class="size-10 text-muted"
        />
        <p class="text-xl font-bold tracking-widest uppercase text-highlighted">
          Tiller
        </p>
        <p class="text-xs text-muted">
          v0.1.0 — At the helm of your stack
        </p>
      </div>
    </div>

    <SettingsOptionDrawer
      v-model:open="openRefreshInterval"
      v-model="settings.refreshInterval"
      title="Refresh Interval"
      :options="intervalOptions"
    />

    <SettingsOptionDrawer
      v-model:open="openTheme"
      v-model="colorMode.preference"
      title="Theme"
      :options="themeOptions"
    />
  </div>
</template>

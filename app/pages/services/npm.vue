<script setup lang="ts">
definePageMeta({ layout: 'detail' })

const router = useRouter()
const store = useNpmStore()
const { baseUrl } = useIntegrationConfig('npm')

const badgeColor = computed(() => {
  if (store.loading) return 'neutral'
  if (store.status === 'online') return 'success'
  if (store.status === 'warning') return 'warning'
  return 'error'
})

const badgeLabel = computed(() => {
  if (store.loading) return '...'
  if (store.status === 'online') return 'ONLINE'
  if (store.status === 'warning') return 'ONLINE'
  return 'OFFLINE'
})

const activeHostsPercent = computed(() => {
  const total = store.proxyHosts.length
  if (!total) return 0
  return Math.round((store.enabledCount / total) * 100)
})

const hostDotClass = (host: { enabled: boolean, meta: { nginx_online: boolean } }): string => {
  if (!host.enabled) return 'bg-neutral-500'
  if (!host.meta.nginx_online) return 'bg-red-400'
  return 'bg-green-400'
}

const certDaysRemaining = (expiresOn: string): number => {
  return Math.ceil((new Date(expiresOn).getTime() - Date.now()) / 86400000)
}

const certDaysClass = (days: number): string => {
  if (days <= 14) return 'text-red-400'
  if (days <= 30) return 'text-orange-400'
  return 'text-green-400'
}

const certProgressPercent = (cert: { provider: string, expires_on: string }): number => {
  const totalDays = cert.provider === 'letsencrypt' ? 90 : 365
  const days = certDaysRemaining(cert.expires_on)
  return Math.max(0, Math.min(100, Math.round((days / totalDays) * 100)))
}

const certProgressColor = (days: number): 'success' | 'warning' | 'error' => {
  if (days <= 14) return 'error'
  if (days <= 30) return 'warning'
  return 'success'
}

const certProviderLabel = (provider: string): string => {
  return provider === 'letsencrypt' ? 'Let\'s Encrypt' : 'Custom'
}

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
            Nginx Proxy Manager
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
      integration-id="npm"
      name="Nginx Proxy Manager"
      needs-api-key
      api-key-label="Password"
      needs-username
    />

    <div class="flex flex-col gap-4 px-4 pb-6">
      <!-- Stats row -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-elevated rounded-xl px-3 py-3">
          <p class="text-xs text-muted mb-1">
            Proxy Hosts
          </p>
          <USkeleton
            v-if="store.loading"
            class="h-7 w-10"
          />
          <p
            v-else
            class="text-2xl font-bold text-blue-400"
          >
            {{ store.proxyHosts.length }}
          </p>
        </div>
        <div class="bg-elevated rounded-xl px-3 py-3">
          <p class="text-xs text-muted mb-1">
            SSL Certs
          </p>
          <USkeleton
            v-if="store.loading"
            class="h-7 w-10"
          />
          <p
            v-else
            class="text-2xl font-bold text-green-400"
          >
            {{ store.certificates.length }}
          </p>
        </div>
        <div class="bg-elevated rounded-xl px-3 py-3">
          <p class="text-xs text-muted mb-1">
            Expiring
          </p>
          <USkeleton
            v-if="store.loading"
            class="h-7 w-10"
          />
          <p
            v-else
            class="text-2xl font-bold"
            :class="store.expiringCount > 0 ? 'text-orange-400' : 'text-muted'"
          >
            {{ store.expiringCount }}
          </p>
        </div>
      </div>

      <!-- Active hosts progress bar -->
      <div
        v-if="!store.loading && store.proxyHosts.length"
        class="bg-elevated rounded-xl px-4 py-3"
      >
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-muted">
            Active hosts
          </p>
          <p class="text-sm font-semibold text-green-400">
            {{ store.enabledCount }} / {{ store.proxyHosts.length }} enabled
          </p>
        </div>
        <UProgress
          :value="activeHostsPercent"
          color="success"
          size="sm"
        />
      </div>
      <div
        v-else-if="store.loading"
        class="bg-elevated rounded-xl px-4 py-3"
      >
        <div class="flex items-center justify-between mb-2">
          <USkeleton class="h-4 w-24" />
          <USkeleton class="h-4 w-20" />
        </div>
        <USkeleton class="h-2 w-full rounded-full" />
      </div>

      <!-- Proxy Hosts list -->
      <div class="bg-elevated rounded-xl overflow-hidden">
        <div class="flex items-center justify-between px-4 pt-3.5 pb-2.5">
          <p class="text-sm font-bold text-highlighted">
            Proxy Hosts
          </p>
          <p
            v-if="!store.loading"
            class="text-xs font-semibold text-blue-400"
          >
            {{ store.enabledCount }} active
          </p>
        </div>

        <!-- Skeleton -->
        <div
          v-if="store.loading"
          class="divide-y divide-default border-t border-default"
        >
          <div
            v-for="i in 5"
            :key="i"
            class="flex items-center gap-3 px-4 py-3"
          >
            <USkeleton class="size-2 rounded-full shrink-0" />
            <div class="flex-1 flex flex-col gap-1.5">
              <USkeleton class="h-4 w-40" />
              <USkeleton class="h-3 w-28" />
            </div>
            <USkeleton class="h-5 w-10 rounded-full shrink-0" />
          </div>
        </div>

        <!-- Host rows -->
        <div
          v-else-if="store.proxyHosts.length"
          class="divide-y divide-default border-t border-default"
        >
          <div
            v-for="host in store.proxyHosts"
            :key="host.id"
            class="flex items-center gap-3 px-4 py-3"
          >
            <span
              class="inline-block size-2 rounded-full shrink-0"
              :class="hostDotClass(host)"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-highlighted truncate">
                {{ host.domain_names[0] }}
              </p>
              <p class="text-xs text-muted">
                → {{ host.forward_host }}:{{ host.forward_port }}
              </p>
            </div>
            <UBadge
              :label="host.ssl_forced ? 'SSL' : 'HTTP'"
              :color="host.ssl_forced ? 'success' : 'neutral'"
              variant="subtle"
              size="sm"
              class="shrink-0"
            />
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="px-4 py-6 text-center border-t border-default"
        >
          <p class="text-sm text-muted">
            No proxy hosts found
          </p>
        </div>
      </div>

      <!-- SSL Certificates list -->
      <div class="bg-elevated rounded-xl overflow-hidden">
        <div class="flex items-center justify-between px-4 pt-3.5 pb-2.5">
          <p class="text-sm font-bold text-highlighted">
            SSL Certificates
          </p>
          <p
            v-if="!store.loading && store.expiringCount > 0"
            class="text-xs font-semibold text-orange-400"
          >
            {{ store.expiringCount }} expiring soon
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
            class="px-4 py-3"
          >
            <div class="flex items-center justify-between mb-1.5">
              <USkeleton class="h-4 w-36" />
              <USkeleton class="h-5 w-10" />
            </div>
            <USkeleton class="h-3 w-24 mb-2" />
            <USkeleton class="h-1.5 w-full rounded-full" />
          </div>
        </div>

        <!-- Cert rows -->
        <div
          v-else-if="store.certificates.length"
          class="divide-y divide-default border-t border-default"
        >
          <div
            v-for="cert in store.certificates"
            :key="cert.id"
            class="px-4 py-3"
          >
            <div class="flex items-start justify-between gap-2 mb-0.5">
              <p class="text-sm font-semibold text-highlighted truncate">
                {{ cert.domain_names[0] }}
              </p>
              <p
                class="text-sm font-bold shrink-0"
                :class="certDaysClass(certDaysRemaining(cert.expires_on))"
              >
                {{ certDaysRemaining(cert.expires_on) }}d
              </p>
            </div>
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs text-muted">
                {{ certProviderLabel(cert.provider) }}
              </p>
              <p class="text-xs text-muted">
                Expires in {{ certDaysRemaining(cert.expires_on) }} days
              </p>
            </div>
            <UProgress
              :value="certProgressPercent(cert)"
              :color="certProgressColor(certDaysRemaining(cert.expires_on))"
              size="xs"
            />
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="px-4 py-6 text-center border-t border-default"
        >
          <p class="text-sm text-muted">
            No certificates found
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

<script setup lang="ts">
import { saveIntegrations } from '~/composables/useIntegrationConfig'
import type { IntegrationId } from '~/composables/useIntegrationConfig'

const { setHeader } = useAppHeader()
const store = useServicesStore()

setHeader({
  title: 'Services',
  subtitle: `${store.configuredServices.length} integrations connected`
})

const summaryCells = computed(() => [
  { label: 'Online', value: store.summary.online, valueClass: 'text-primary' },
  { label: 'Warning', value: store.summary.warning, valueClass: 'text-orange-400' },
  { label: 'Offline', value: store.summary.offline, valueClass: 'text-red-400' }
])

// Map service store IDs to integration IDs + field config
const integrationMeta: Record<string, {
  integrationId: IntegrationId
  name: string
  icon: string
  needsApiKey: boolean
  apiKeyLabel: string
  needsUsername: boolean
}> = {
  'ollama': {
    integrationId: 'ollama',
    name: 'Ollama',
    icon: 'i-simple-icons-ollama',
    needsApiKey: false,
    apiKeyLabel: '',
    needsUsername: false
  },
  'uptime-kuma': {
    integrationId: 'uptimeKuma',
    name: 'Uptime Kuma',
    icon: 'i-lucide-activity',
    needsApiKey: true,
    apiKeyLabel: 'API Key',
    needsUsername: false
  },
  'pihole': {
    integrationId: 'pihole',
    name: 'Pi-hole',
    icon: 'i-simple-icons-pihole',
    needsApiKey: true,
    apiKeyLabel: 'App Password',
    needsUsername: false
  },
  'n8n': {
    integrationId: 'n8n',
    name: 'n8n',
    icon: 'i-simple-icons-n8n',
    needsApiKey: true,
    apiKeyLabel: 'API Key',
    needsUsername: false
  },
  'npm': {
    integrationId: 'npm',
    name: 'Nginx Proxy Manager',
    icon: 'i-simple-icons-nginx',
    needsApiKey: true,
    apiKeyLabel: 'Password',
    needsUsername: true
  }
}

const availableServices = computed(() =>
  store.services.filter(s => !store.configuredIds.includes(s.id))
)

// Modal state
const modalOpen = ref(false)
const selectedServiceId = ref<string | null>(null)
const formBaseUrl = ref('')
const formApiKey = ref('')
const formUsername = ref('')
const saving = ref(false)
const saveError = ref('')

const selectedMeta = computed(() =>
  selectedServiceId.value ? integrationMeta[selectedServiceId.value] ?? null : null
)

const openAddModal = (serviceId: string) => {
  selectedServiceId.value = serviceId
  formBaseUrl.value = ''
  formApiKey.value = ''
  formUsername.value = ''
  saveError.value = ''
  modalOpen.value = true
}

const saveIntegration = async () => {
  if (!selectedMeta.value || !formBaseUrl.value.trim()) return
  saving.value = true
  saveError.value = ''
  try {
    await saveIntegrations({
      [selectedMeta.value.integrationId]: {
        baseUrl: formBaseUrl.value.trim() || null,
        apiKey: selectedMeta.value.needsApiKey ? (formApiKey.value.trim() || null) : null,
        username: selectedMeta.value.needsUsername ? (formUsername.value.trim() || null) : null
      }
    })
    modalOpen.value = false
  } catch {
    saveError.value = 'Failed to save. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-4 flex flex-col gap-4">
    <div class="grid grid-cols-3 gap-2">
      <div
        v-for="cell in summaryCells"
        :key="cell.label"
        class="bg-elevated rounded-xl py-3 text-center"
      >
        <p
          class="text-xl font-bold"
          :class="cell.valueClass"
        >
          {{ cell.value }}
        </p>
        <p class="text-xs text-muted mt-0.5">
          {{ cell.label }}
        </p>
      </div>
    </div>

    <template v-if="store.configuredServices.length > 0">
      <p class="text-xs font-semibold tracking-widest text-muted uppercase px-1">
        Active
      </p>
      <ServiceCard
        v-for="service in store.configuredServices"
        :key="service.id"
        :service="service"
      />
    </template>

    <template v-if="availableServices.length > 0">
      <p class="text-xs font-semibold tracking-widest text-muted uppercase px-1 mt-2">
        Available
      </p>
      <div class="flex flex-col gap-2">
        <div
          v-for="service in availableServices"
          :key="service.id"
          class="bg-elevated rounded-xl px-4 py-3 flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <UIcon
              :name="service.icon"
              class="size-5 text-muted"
            />
            <p class="text-sm font-semibold text-highlighted">
              {{ service.name }}
            </p>
          </div>
          <UButton
            size="xs"
            variant="soft"
            color="primary"
            icon="i-lucide-plus"
            label="Add"
            @click="openAddModal(service.id)"
          />
        </div>
      </div>
    </template>

    <!-- Add Integration Modal -->
    <UModal
      v-model:open="modalOpen"
      :title="selectedMeta ? `Connect ${selectedMeta.name}` : 'Add Integration'"
    >
      <template #body>
        <form
          class="flex flex-col gap-4"
          @submit.prevent="saveIntegration"
        >
          <UFormField label="Base URL">
            <UInput
              v-model="formBaseUrl"
              placeholder="http://192.168.1.x:port"
              class="w-full"
              autofocus
            />
          </UFormField>

          <UFormField
            v-if="selectedMeta?.needsUsername"
            label="Email"
          >
            <UInput
              v-model="formUsername"
              type="email"
              placeholder="admin@example.com"
              class="w-full"
            />
          </UFormField>

          <UFormField
            v-if="selectedMeta?.needsApiKey"
            :label="selectedMeta.apiKeyLabel"
          >
            <UInput
              v-model="formApiKey"
              type="password"
              placeholder="Enter your key or password"
              class="w-full"
            />
          </UFormField>

          <p
            v-if="saveError"
            class="text-sm text-red-500"
          >
            {{ saveError }}
          </p>
        </form>
      </template>

      <template #footer>
        <div class="flex gap-2 justify-end">
          <UButton
            variant="ghost"
            color="neutral"
            label="Cancel"
            @click="modalOpen = false"
          />
          <UButton
            color="primary"
            label="Save"
            :loading="saving"
            :disabled="!formBaseUrl.trim()"
            @click="saveIntegration"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

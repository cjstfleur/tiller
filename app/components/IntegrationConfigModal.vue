<script setup lang="ts">
import { saveIntegrations } from '~/composables/useIntegrationConfig'
import type { IntegrationId } from '~/composables/useIntegrationConfig'

interface Props {
  integrationId: IntegrationId
  name: string
  needsApiKey?: boolean
  apiKeyLabel?: string
  needsUsername?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  needsApiKey: false,
  apiKeyLabel: 'API Key',
  needsUsername: false
})

const open = defineModel<boolean>('open', { default: false })

const { baseUrl, apiKey, username } = useIntegrationConfig(props.integrationId)

const formBaseUrl = ref('')
const formApiKey = ref('')
const formUsername = ref('')
const saving = ref(false)
const error = ref('')

watch(open, (val) => {
  if (val) {
    formBaseUrl.value = baseUrl.value ?? ''
    formApiKey.value = apiKey.value ?? ''
    formUsername.value = username.value ?? ''
    error.value = ''
  }
})

const save = async () => {
  if (!formBaseUrl.value.trim()) return
  saving.value = true
  error.value = ''
  try {
    await saveIntegrations({
      [props.integrationId]: {
        baseUrl: formBaseUrl.value.trim() || null,
        apiKey: props.needsApiKey ? (formApiKey.value.trim() || null) : null,
        username: props.needsUsername ? (formUsername.value.trim() || null) : null
      }
    })
    open.value = false
  } catch {
    error.value = 'Failed to save. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="`${name} Settings`"
  >
    <template #body>
      <form
        class="flex flex-col gap-4"
        @submit.prevent="save"
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
          v-if="needsUsername"
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
          v-if="needsApiKey"
          :label="apiKeyLabel"
        >
          <UInput
            v-model="formApiKey"
            type="password"
            placeholder="Enter your key or password"
            class="w-full"
          />
        </UFormField>

        <p
          v-if="error"
          class="text-sm text-red-500"
        >
          {{ error }}
        </p>
      </form>
    </template>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <UButton
          variant="ghost"
          color="neutral"
          label="Cancel"
          @click="open = false"
        />
        <UButton
          color="primary"
          label="Save"
          :loading="saving"
          :disabled="!formBaseUrl.trim()"
          @click="save"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { login, session } = useAuth()
const password = ref('')
const error = ref('')
const loading = ref(false)

const submit = async () => {
  if (!password.value) return
  error.value = ''
  loading.value = true
  try {
    await login(password.value)
    await navigateTo('/dashboard')
  } catch {
    error.value = 'Invalid password. Please try again.'
  } finally {
    loading.value = false
  }
}

// Already authenticated → redirect
onMounted(async () => {
  if (session.value?.authenticated) {
    await navigateTo('/dashboard')
  }
})
</script>

<template>
  <div class="min-h-dvh flex items-center justify-center bg-background p-6">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <div class="flex items-center justify-center gap-2 mb-3">
          <UIcon
            name="i-lucide-anchor"
            class="size-8 text-primary"
          />
        </div>
        <h1 class="text-2xl font-bold text-highlighted">
          Tiller
        </h1>
        <p class="text-sm text-muted mt-1">
          Sign in to your homelab dashboard
        </p>
      </div>

      <UCard>
        <form
          class="flex flex-col gap-4"
          @submit.prevent="submit"
        >
          <UFormField label="Password">
            <UInput
              v-model="password"
              type="password"
              placeholder="Enter your password"
              autocomplete="current-password"
              class="w-full"
              autofocus
            />
          </UFormField>

          <p
            v-if="error"
            class="text-sm text-red-500"
          >
            {{ error }}
          </p>

          <UButton
            type="submit"
            color="primary"
            class="w-full justify-center"
            :loading="loading"
          >
            Sign in
          </UButton>
        </form>
      </UCard>
    </div>
  </div>
</template>

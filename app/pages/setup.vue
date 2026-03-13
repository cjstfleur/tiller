<script setup lang="ts">
definePageMeta({ layout: false })

const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const { session } = useAuth()

const submit = async () => {
  error.value = ''

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/setup', { method: 'POST', body: { password: password.value } })
    session.value = { authenticated: true, setupRequired: false }
    await navigateTo('/dashboard')
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    error.value = err.data?.statusMessage ?? 'Setup failed. Please try again.'
  } finally {
    loading.value = false
  }
}

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
          Welcome to Tiller
        </h1>
        <p class="text-sm text-muted mt-1">
          Set a password to secure your dashboard
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
              placeholder="At least 8 characters"
              autocomplete="new-password"
              class="w-full"
              autofocus
            />
          </UFormField>

          <UFormField label="Confirm password">
            <UInput
              v-model="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              autocomplete="new-password"
              class="w-full"
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
            Create password
          </UButton>
        </form>
      </UCard>
    </div>
  </div>
</template>

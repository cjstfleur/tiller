<script setup>
const settings = useSettingsStore()

// Load integrations config and settings from DB before starting polling
onMounted(async () => {
  await loadIntegrations()
  await settings.load()
  useServicePolling()
})

const chatStore = useChatStore()
onMounted(async () => {
  await chatStore.loadMessages()
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

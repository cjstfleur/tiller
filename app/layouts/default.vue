<template>
  <div class="flex flex-row h-dvh overflow-hidden">
    <AppSidebar />
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <AppHeader />
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
      <AppBottomNavigation />
    </div>
  </div>
</template>

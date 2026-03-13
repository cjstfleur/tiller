<script setup lang="ts">
const { headerState } = useAppHeader()
</script>

<template>
  <header class="shrink-0 px-4 pt-4 pb-3">
    <p
      v-if="headerState.greeting"
      class="text-xs font-semibold tracking-widest text-muted uppercase mb-1"
    >
      {{ headerState.greeting }}
    </p>
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold text-highlighted leading-tight">
          {{ headerState.title }}
        </h1>
        <p
          v-if="headerState.subtitle"
          class="text-sm text-muted mt-0.5 flex items-center gap-1.5"
        >
          <span
            v-if="headerState.subtitleStatus === 'online'"
            class="inline-block size-2 rounded-full bg-green-400 shrink-0"
          />
          {{ headerState.subtitle }}
        </p>
      </div>
      <div
        v-if="headerState.actions.length"
        class="flex items-center gap-2 pt-0.5 shrink-0"
      >
        <UButton
          v-for="(action, i) in headerState.actions"
          :key="i"
          :icon="action.icon"
          :trailing-icon="action.trailingIcon"
          :label="action.label"
          :variant="action.label ? 'soft' : 'ghost'"
          color="neutral"
          size="sm"
          @click="action.onClick"
        />
      </div>
    </div>
  </header>
</template>

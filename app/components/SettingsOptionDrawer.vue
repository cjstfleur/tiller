<script setup lang="ts">
export interface SettingsOption {
  label: string
  value: string
}

const props = defineProps<{
  title: string
  options: SettingsOption[]
}>()

const open = defineModel<boolean>('open', { default: false })
const selected = defineModel<string>({ required: true })

const select = (value: string) => {
  selected.value = value
  open.value = false
}
</script>

<template>
  <UDrawer
    v-model:open="open"
    handle
  >
    <template #header>
      <p class="text-base font-semibold text-center text-highlighted w-full">
        {{ props.title }}
      </p>
    </template>

    <template #body>
      <div class="divide-y divide-default pb-6">
        <button
          v-for="opt in props.options"
          :key="opt.value"
          class="flex items-center justify-between w-full px-5 py-3.5 transition-colors active:bg-accented"
          @click="select(opt.value)"
        >
          <span
            class="text-sm"
            :class="selected === opt.value ? 'text-primary font-semibold' : 'text-highlighted'"
          >
            {{ opt.label }}
          </span>
          <UIcon
            v-if="selected === opt.value"
            name="i-lucide-check"
            class="size-4 text-primary"
          />
        </button>
      </div>
    </template>
  </UDrawer>
</template>

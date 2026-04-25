<template>
  <button
    :class="[
      'px-4 py-2 rounded-button text-sm font-medium transition-all',
      variant === 'primary'
        ? 'bg-primary text-white hover:opacity-90'
        : 'bg-white border border-border-light text-text-primary hover:bg-hover-bg',
      disabled && 'opacity-50 cursor-not-allowed',
    ]"
    :disabled="disabled"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}>(), {
  variant: 'primary',
  disabled: false,
})

const emit = defineEmits<{ (e: 'click'): void }>()
</script>
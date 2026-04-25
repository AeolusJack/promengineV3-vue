<template>
  <button
    type="button"
    @click="toggle"
    :class="[
      'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
      modelValue ? 'bg-primary' : 'bg-gray-300',
    ]"
  >
    <span
      :class="[
        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
        modelValue ? 'translate-x-4' : 'translate-x-0.5',
      ]"
    />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>
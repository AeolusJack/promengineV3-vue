<template>
  <Teleport to="body"  v-if="visible">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/20" @click="emit('close')"></div>
      <div class="relative bg-white rounded-modal shadow-xl w-full max-w-md p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-medium">{{ title }}</h3>
          <button @click="emit('close')" class="p-1 rounded hover:bg-hover-bg">
            <X class="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { onBeforeUnmount } from 'vue'

defineProps<{
  visible: boolean
  title: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

onBeforeUnmount(() => {
  emit('close')
})


</script>
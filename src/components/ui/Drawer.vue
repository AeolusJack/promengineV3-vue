<template>

  <Teleport to="body" v-if="visible">
    <div v-if="visible" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-black/20" @click="emit('close')"></div>
      <div class="relative w-[480px] h-full bg-white shadow-xl overflow-auto">
        <div class="sticky top-0 bg-white border-b border-border-light px-5 py-4 flex items-center justify-between">
          <h3 class="font-medium">{{ title }}</h3>
          <button @click="emit('close')" class="p-1 rounded hover:bg-hover-bg">
            <X class="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        <div class="p-5">
          <slot />
        </div>
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
  // 确保组件卸载时关闭
  emit('close')
})
</script>
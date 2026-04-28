<template>
  <div class="relative inline-block">
    <button @click="toggleMenu" class="p-1 rounded hover:bg-hover-bg transition-colors">
      <MoreHorizontal class="w-4 h-4 text-text-secondary" />
    </button>
    <div v-if="visible" class="absolute right-0 mt-1 w-40 bg-white rounded-card shadow-card border border-border-light z-50">
      <button @click="handleAction('memory')" class="w-full px-4 py-2 text-left text-sm hover:bg-hover-bg flex items-center">
        <Bookmark class="w-4 h-4 mr-2" />存入记忆
      </button>
      <button @click="handleAction('image')" class="w-full px-4 py-2 text-left text-sm hover:bg-hover-bg flex items-center">
        <Image class="w-4 h-4 mr-2" />导出长图
      </button>
      <button @click="handleAction('pdf')" class="w-full px-4 py-2 text-left text-sm hover:bg-hover-bg flex items-center">
        <FileText class="w-4 h-4 mr-2" />导出PDF
      </button>
      <button @click="handleAction('share')" class="w-full px-4 py-2 text-left text-sm hover:bg-hover-bg flex items-center">
        <Share class="w-4 h-4 mr-2" />分享
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { MoreHorizontal, Bookmark, Image, FileText, Share } from 'lucide-vue-next'

const props = defineProps<{ content: string; messageId: string }>()
const emit = defineEmits<{
  (e: 'saveToMemory', content: string): void
  (e: 'exportImage', content: string): void
  (e: 'exportPdf', content: string): void
  (e: 'share', messageId: string): void
}>()

const visible = ref(false)
const toggleMenu = () => { visible.value = !visible.value }
const closeMenu = () => { visible.value = false }

const handleAction = (action: string) => {
  switch (action) {
    case 'memory': emit('saveToMemory', props.content); break
    case 'image': emit('exportImage', props.content); break
    case 'pdf': emit('exportPdf', props.content); break
    case 'share': emit('share', props.messageId); break
  }
  closeMenu()
}

const handleClickOutside = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).closest('.relative')) closeMenu()
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>
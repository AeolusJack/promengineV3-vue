<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center border-b border-border-light mb-4">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
          activeTab === tab.id
            ? 'border-primary text-primary'
            : 'border-transparent text-text-secondary hover:text-text-primary',
        ]"
      >
        {{ tab.name }}
      </button>
    </div>

    <div class="flex-1 overflow-hidden">
      <LayerBrowser v-if="activeTab === 'layer'" />
      <RetrievalDebugger v-else-if="activeTab === 'debug'" />
      <QualityWorkshop v-else-if="activeTab === 'quality'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LayerBrowser from '@/components/memory/LayerBrowser.vue'
import RetrievalDebugger from '@/components/memory/RetrievalDebugger.vue'
import QualityWorkshop from '@/components/memory/QualityWorkshop.vue'
import { onBeforeRouteLeave } from 'vue-router'

import { useMemoryStore } from '@/stores/memory'

const memoryStore = useMemoryStore()

onMounted(async () => {
  await memoryStore.fetchLayers()
  await memoryStore.fetchMemories()
})


const tabs = [
  { id: 'layer', name: '分层浏览' },
  { id: 'debug', name: '检索调试' },
  { id: 'quality', name: '质量工坊' },
]
const activeTab = ref('layer')

const showCreateDrawer = ref(false)
const editingAgent = ref(null)

onBeforeRouteLeave((to, from, next) => {
  showCreateDrawer.value = false
  editingAgent.value = null
  next()
})
</script>
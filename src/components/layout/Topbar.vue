<template>
  <header class="h-16 bg-white border-b border-border-light flex items-center justify-between px-6">
    <div class="text-text-secondary text-sm">
      {{ currentPageTitle }}
    </div>
    <div class="flex items-center space-x-4">
      <button class="p-2 rounded-full hover:bg-hover-bg transition-colors">
        <Settings class="w-5 h-5 text-text-secondary" />
      </button>
      <div class="flex items-center">
        <img src="@/assets/avatar-default.png" alt="Avatar" class="w-8 h-8 rounded-full" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Settings } from 'lucide-vue-next'

const route = useRoute()
const currentPageTitle = computed(() => {
  const titles: Record<string, string> = {
    chat: '对话',
    memory: '记忆',
    agent: 'Agent',
    skill: 'Skill',
    tools: '工具',
    settings: '配置',
  }
  return titles[route.path.split('/')[1]] || '璇玑台'
})
</script>
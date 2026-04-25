<template>
  <div class="card p-4 relative group">
    <div class="flex items-start justify-between">
      <div class="flex items-center space-x-3">
        <AgentAvatar :agent="agent" size="md" />
        <div>
          <h4 class="font-medium">{{ agent.name }}</h4>
          <p class="text-xs text-text-secondary mt-0.5">{{ agent.description || '暂无描述' }}</p>
        </div>
      </div>
      <Toggle :model-value="agent.enabled" @update:model-value="emit('toggle', agent, $event)" />
    </div>
    <div class="mt-3 flex items-center text-xs text-text-secondary space-x-3">
      <span class="flex items-center">
        <Cpu class="w-3 h-3 mr-1" />
        {{ agent.mode === 'silicon' ? '硅基' : '碳基' }}
      </span>
      <span class="flex items-center">
        <Tag class="w-3 h-3 mr-1" />
        {{ agent.createdBy === 'frontend' ? '前端搭建' : '后端注册' }}
      </span>
    </div>
    <div class="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
      <button @click="emit('edit', agent)" class="p-1 rounded hover:bg-hover-bg">
        <Edit class="w-4 h-4 text-text-secondary" />
      </button>
      <button @click="emit('delete', agent.id)" class="p-1 rounded hover:bg-hover-bg">
        <Trash class="w-4 h-4 text-text-secondary" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Cpu, Tag, Edit, Trash } from 'lucide-vue-next'
import AgentAvatar from './AgentAvatar.vue'
import Toggle from '@/components/ui/Toggle.vue'
import type { AgentConfig } from '@/types'

defineProps<{ agent: AgentConfig }>()
const emit = defineEmits<{
  (e: 'edit', agent: AgentConfig): void
  (e: 'toggle', agent: AgentConfig, enabled: boolean): void
  (e: 'delete', id: string): void
}>()
</script>
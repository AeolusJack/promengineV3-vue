<template>
  <div
    :id="`agent-card-${agent.id}`"
    class="card p-4 relative group transition-all duration-300"
    :class="{ 'ring-2 ring-primary/30 bg-primary/[0.02]': highlighted }"
  >
    <div class="flex items-start justify-between">
      <div class="flex items-center space-x-3">
        <AgentAvatar :agent="agent" size="md" />
        <div>
          <h4 class="font-medium">{{ agent.name }}</h4>
          <p class="text-xs text-text-secondary mt-0.5">
            {{ agent.description || $t('agent.noDescription') }}
          </p>
        </div>
      </div>
      <Toggle :model-value="agent.enabled" @update:model-value="emit('toggle', agent, $event)" />
    </div>

    <div class="mt-3 flex items-center text-xs text-text-secondary space-x-3">
      <span class="flex items-center">
        <Cpu class="w-3 h-3 mr-1" />
        {{ agent.mode === 'silicon' ? $t('agent.silicon') : $t('agent.carbon') }}
      </span>
      <span class="flex items-center">
        <Tag class="w-3 h-3 mr-1" />
        {{ agent.createdBy === 'frontend' ? $t('agent.frontend') : $t('agent.backend') }}
      </span>
    </div>

    <!-- 操作按钮（右下角） -->
    <div class="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
      <button @click="emit('edit', agent)" class="p-1.5 rounded hover:bg-hover-bg">
        <Edit class="w-4 h-4 text-text-secondary" />
      </button>
      <button @click="emit('delete', agent.id)" class="p-1.5 rounded hover:bg-hover-bg">
        <Trash class="w-4 h-4 text-text-secondary" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Cpu, Tag, Edit, Trash } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import AgentAvatar from './AgentAvatar.vue'
import Toggle from '@/components/ui/Toggle.vue'
import type { AgentConfig } from '@/api/agent'

const { t } = useI18n()

defineProps<{
  agent: AgentConfig
  highlighted?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', agent: AgentConfig): void
  (e: 'toggle', agent: AgentConfig, enabled: boolean): void
  (e: 'delete', id: string): void
}>()
</script>
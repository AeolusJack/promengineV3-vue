<template>
  <div class="flex h-full">
    <div class="w-56 border-r border-border-light pr-4 overflow-y-auto">
      <div class="text-xs text-text-secondary uppercase tracking-wider mb-2">我的智能体</div>
      <div class="space-y-2">
        <div
          v-for="agent in independentAgents"
          :key="agent.id"
          class="flex items-center p-2 rounded-card hover:bg-hover-bg cursor-pointer"
          @click="selectAgent(agent)"
        >
          <AgentAvatar :agent="agent" size="sm" class="mr-2" />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">{{ agent.name }}</div>
            <div class="flex items-center mt-0.5">
              <StatusBadge :status="getAgentStatus(agent)" />
            </div>
          </div>
        </div>
      </div>
      <div class="text-xs text-text-secondary uppercase tracking-wider mt-6 mb-2">全部Agent</div>
    </div>

    <div class="flex-1 pl-4 overflow-auto">
      <div class="grid grid-cols-3 gap-4">
        <AgentCard
          v-for="agent in agents"
          :key="agent.id"
          :agent="agent"
          @edit="openEdit"
          @toggle="handleToggle"
          @delete="handleDelete"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAgentStore } from '@/stores/agent'
import AgentCard from './AgentCard.vue'
import AgentAvatar from './AgentAvatar.vue'
import StatusBadge from './StatusBadge.vue'
import type { AgentConfig } from '@/types'

const store = useAgentStore()
const { agents } = storeToRefs(store)   // 使用 storeToRefs 解构保持响应性

// 独立生命体列表（带默认空数组保护）
const independentAgents = computed(() => {
  return (agents.value || []).filter(a => a.isIndependent)
})

const selectAgent = (agent: AgentConfig) => {
  console.log('Select agent', agent)
}

const getAgentStatus = (agent: AgentConfig) => {
  if (!agent.enabled) return 'inactive'
  return 'active'
}

const openEdit = (agent: AgentConfig) => {
  // 通过父组件打开抽屉（由 AgentView 提供）
}

const handleToggle = (agent: AgentConfig, enabled: boolean) => {
  store.toggleAgent(agent.id, enabled)
}

const handleDelete = (id: string) => {
  if (confirm('确定删除该Agent？')) {
    store.deleteAgent(id)
  }
}

onMounted(() => {
  store.fetchAgents()
})
</script>
<template>
  <div class="flex h-full">
    <!-- 左侧：我的智能体列表 -->
    <div class="w-56 border-r border-border-light pr-4 overflow-y-auto">
      <div class="text-xs text-text-secondary uppercase tracking-wider mb-2">
        {{ $t('agent.myAgents') }}
      </div>
      <div class="space-y-2">
        <div
          v-for="agent in independentAgents"
          :key="agent.id"
          class="flex items-center p-2 rounded-card hover:bg-hover-bg cursor-pointer transition-colors"
          :class="{ 'bg-primary/5 ring-1 ring-primary/30': selectedAgentId === agent.id }"
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
        <div v-if="independentAgents.length === 0" class="text-xs text-text-secondary py-2">
          {{ $t('agent.noIndependent') }}
        </div>
      </div>

      <div class="text-xs text-text-secondary uppercase tracking-wider mt-6 mb-2">
        {{ $t('agent.allAgents') }}
      </div>
    </div>

    <!-- 右侧：全部 Agent 卡片网格 -->
    <div class="flex-1 pl-4 overflow-auto">
      <div class="grid grid-cols-3 gap-4">
        <AgentCard
          v-for="agent in agents"
          :key="agent.id"
          :agent="agent"
          :highlighted="selectedAgentId === agent.id"
          @edit="handleEdit"
          @toggle="handleToggle"
          @delete="handleDelete"
        />
      </div>
      <div v-if="agents.length === 0" class="text-center text-text-secondary py-10">
        {{ $t('agent.empty') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useAgentStore } from '@/stores/agent'
import type { AgentConfig } from '@/api/agent'
import AgentCard from './AgentCard.vue'
import AgentAvatar from './AgentAvatar.vue'
import StatusBadge from './StatusBadge.vue'

const { t } = useI18n()
const store = useAgentStore()
const { agents } = storeToRefs(store)

const emit = defineEmits<{
  (e: 'edit', agent: AgentConfig): void
}>()

const selectedAgentId = ref<string | null>(null)

// 独立生命体列表
const independentAgents = computed(() =>
  (agents.value || []).filter(a => a.isIndependent)
)

// 点击左侧智能体 → 高亮并滚动
const selectAgent = (agent: AgentConfig) => {
  selectedAgentId.value = agent.id

  // 滚动到对应的卡片
  setTimeout(() => {
    const card = document.getElementById(`agent-card-${agent.id}`)
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 增加短暂的脉冲动画
      card.classList.add('ring-2', 'ring-primary/50')
      setTimeout(() => card.classList.remove('ring-2', 'ring-primary/50'), 1500)
    }
  }, 50)
}

const getAgentStatus = (agent: AgentConfig): 'active' | 'inactive' => {
  return agent.enabled ? 'active' : 'inactive'
}

const handleEdit = (agent: AgentConfig) => {
  emit('edit', agent)
}

const handleToggle = (agent: AgentConfig, enabled: boolean) => {
  store.toggleAgent(agent.id, enabled)
}

const handleDelete = (id: string) => {
  if (confirm(t('common.confirm'))) {
    store.deleteAgent(id)
    if (selectedAgentId.value === id) selectedAgentId.value = null
  }
}

onMounted(() => {
  store.fetchAgents()
})
</script>
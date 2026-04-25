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
      <button
        v-if="activeTab === 'list'"
        @click="showCreateDrawer = true"
        class="ml-auto btn-primary text-sm px-3 py-1.5"
      >
        + 新建Agent
      </button>
    </div>

    <div class="flex-1 overflow-hidden">
      <KeepAlive>
        <component :is="currentComponent" @edit="openEditAgent" />
      </KeepAlive>
    </div>

    <AgentDrawer
      v-if="showCreateDrawer || editingAgent"
      :agent="editingAgent"
      @close="closeDrawer"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import AgentListView from '@/components/agent/AgentListView.vue'
import AgentGroupView from '@/components/agent/AgentGroupView.vue'
import AgentDrawer from '@/components/agent/AgentDrawer.vue'
import { useAgentStore } from '@/stores/agent'
import type { AgentConfig } from '@/types'

const tabs = [
  { id: 'list', name: 'Agent列表', component: AgentListView },
  { id: 'group', name: '群聊', component: AgentGroupView },
]
const activeTab = ref('list')
const showCreateDrawer = ref(false)
const editingAgent = ref<AgentConfig | null>(null)

const store = useAgentStore()

const currentComponent = computed(() => {
  return tabs.find(t => t.id === activeTab.value)?.component
})

onMounted(() => {
  store.fetchAgents()
})

const closeDrawer = () => {
  showCreateDrawer.value = false
  editingAgent.value = null
}

const handleSave = async (data: Partial<AgentConfig>) => {
  if (editingAgent.value) {
    await store.updateAgent(editingAgent.value.id, data)
  } else {
    await store.createAgent(data)
  }
  closeDrawer()
}

const openEditAgent = (agent: AgentConfig) => {
  editingAgent.value = agent
}
</script>
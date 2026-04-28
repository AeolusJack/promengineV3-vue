<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-1">{{ $t('agent.groupName') }}</label>
      <input v-model="form.name" type="text" :placeholder="$t('agent.groupNamePlaceholder')" class="w-full input" required />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">{{ $t('agent.selectAgents') }}</label>
      <div class="border border-border-light rounded-card p-3 max-h-48 overflow-y-auto space-y-2">
        <label v-for="agent in availableAgents" :key="agent.id" class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" :value="agent.id" v-model="selectedAgentIds" class="rounded" />
          <AgentAvatar :agent="agent" size="sm" />
          <span class="text-sm">{{ agent.name }}</span>
        </label>
      </div>
      <p class="text-xs text-text-secondary mt-1">{{ $t('agent.selectedCount', { count: selectedAgentIds.length }) }}</p>
    </div>

    <div v-if="selectedAgents.length > 0">
      <label class="block text-sm font-medium mb-1">{{ $t('agent.roleSettings') }}</label>
      <div class="space-y-2">
        <div v-for="agent in selectedAgents" :key="agent.id" class="flex items-center space-x-2">
          <AgentAvatar :agent="agent" size="sm" class="flex-shrink-0" />
          <input v-model="form.agentRoles[agent.id]" type="text" :placeholder="$t('agent.rolePlaceholder', { name: agent.name })" class="flex-1 input" />
        </div>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">{{ $t('agent.initialTopic') }}</label>
      <textarea v-model="form.topic" rows="3" :placeholder="$t('agent.topicPlaceholder')" class="w-full input" required></textarea>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('agent.maxRoundsField') }}</label>
        <input v-model.number="form.maxRounds" type="number" min="1" max="50" class="w-full input" />
      </div>
      <div class="flex items-end pb-2">
        <label class="flex items-center">
          <input type="checkbox" v-model="form.autoMode" class="rounded mr-2" />
          <span class="text-sm">{{ $t('agent.autoModeCheckbox') }}</span>
        </label>
      </div>
    </div>

    <div class="flex justify-end space-x-3 pt-2">
      <button type="button" @click="emit('cancel')" class="btn-secondary">{{ $t('common.cancel') }}</button>
      <button type="submit" class="btn-primary" :disabled="selectedAgentIds.length === 0">
        {{ $t('agent.createGroupBtn') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AgentAvatar from './AgentAvatar.vue'
import { useAgentStore } from '@/stores/agent'

const { t } = useI18n()
const emit = defineEmits<{ (e: 'submit', data: any): void; (e: 'cancel'): void }>()
const store = useAgentStore()
const availableAgents = ref<any[]>([])
const selectedAgentIds = ref<string[]>([])

const form = reactive({
  name: '',
  topic: '',
  maxRounds: 10,
  autoMode: true,
  agentRoles: {} as Record<string, string>,
})

const selectedAgents = computed(() => availableAgents.value.filter(a => selectedAgentIds.value.includes(a.id)))

const handleSubmit = () => {
  const agents = selectedAgents.value.map(agent => ({
    agentId: agent.id,
    name: agent.name,
    avatar: agent.avatar,
    role: form.agentRoles[agent.id] || '',
  }))

  emit('submit', {
    name: form.name,
    agents,
    topic: form.topic,
    maxRounds: form.maxRounds,
    autoMode: form.autoMode,
  })
}

onMounted(async () => {
  await store.fetchAgents()
  availableAgents.value = (store.agents || []).filter(a => a.enabled).map(a => ({
    id: a.id,
    name: a.name,
    avatar: a.avatar,
    enabled: a.enabled,
  }))
})
</script>
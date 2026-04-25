<template>
  <div :class="['flex', message.role === 'user' ? 'justify-end' : 'justify-start']">
    <div class="flex items-start max-w-[80%]">
      <img
        v-if="message.role === 'agent'"
        :src="agentAvatar"
        class="w-6 h-6 rounded-full mr-2 mt-0.5"
      />
      <div
        :class="[
          'px-3 py-2 rounded-card text-sm',
          message.role === 'user'
            ? 'bg-blue-50'
            : message.role === 'system'
            ? 'bg-gray-100 text-text-secondary italic'
            : 'bg-white border border-border-light',
        ]"
      >
        <div v-if="message.role === 'agent'" class="text-xs text-text-secondary mb-0.5">
          {{ message.agentName }}
          <span v-if="agentRole" class="ml-1">· {{ agentRole }}</span>
        </div>
        <div class="whitespace-pre-wrap break-words">{{ message.content }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GroupMessage, GroupAgent } from '@/types'

const props = defineProps<{
  message: GroupMessage
  agents: GroupAgent[]
}>()

const agentAvatar = computed(() => {
  const agent = props.agents.find(a => a.agentId === props.message.agentId)
  return agent?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${props.message.agentId}`
})

const agentRole = computed(() => {
  const agent = props.agents.find(a => a.agentId === props.message.agentId)
  return agent?.role
})
</script>
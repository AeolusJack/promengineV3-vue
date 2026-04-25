<template>
  <div class="relative inline-block">
    <img
      :src="avatarUrl"
      :class="[
        'rounded-full object-cover border-2',
        sizeClasses[size],
        isIndependent && agent.enabled ? 'animate-pulse border-primary/30' : 'border-transparent',
      ]"
      :alt="agent.name"
    />
    <span
      v-if="isIndependent"
      :class="[
        'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
        statusColor,
      ]"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AgentConfig } from '@/types'

const props = withDefaults(defineProps<{
  agent: AgentConfig
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
})

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

const avatarUrl = computed(() => {
  return props.agent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${props.agent.id}`
})

const isIndependent = computed(() => props.agent.isIndependent)

const statusColor = computed(() => {
  if (!props.agent.enabled) return 'bg-gray-400'
  return 'bg-green-500'
})
</script>
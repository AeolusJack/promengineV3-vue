<template>
  <div class="card p-4 relative group">
    <div class="flex items-start justify-between">
      <div>
        <h4 class="font-medium">{{ skill.name }}</h4>
        <p class="text-xs text-text-secondary mt-0.5">{{ skill.description }}</p>
      </div>
      <Toggle :model-value="skill.enabled" @update:model-value="emit('toggle', skill, $event)" />
    </div>
    <div class="mt-3 flex items-center text-xs text-text-secondary space-x-3">
      <span>v{{ skill.version }}</span>
      <span class="flex items-center">
        <Tag class="w-3 h-3 mr-1" />
        {{ sourceLabel }}
      </span>
    </div>
    <div class="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
      <button @click="emit('edit', skill)" class="p-1 rounded hover:bg-hover-bg">
        <Edit class="w-4 h-4 text-text-secondary" />
      </button>
      <button @click="emit('delete', skill.id)" class="p-1 rounded hover:bg-hover-bg">
        <Trash class="w-4 h-4 text-text-secondary" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Tag, Edit, Trash } from 'lucide-vue-next'
import Toggle from '@/components/ui/Toggle.vue'
import type { SkillConfig } from '@/types'

const props = defineProps<{ skill: SkillConfig }>()
const emit = defineEmits<{
  (e: 'edit', skill: SkillConfig): void
  (e: 'toggle', skill: SkillConfig, enabled: boolean): void
  (e: 'delete', id: string): void
}>()

const sourceLabel = computed(() => {
  const map: Record<string, string> = {
    builtin: '内置',
    mcp: 'MCP',
    custom: '自定义',
  }
  return map[props.skill.source] || props.skill.source
})
</script>
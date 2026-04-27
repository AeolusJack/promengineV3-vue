<template>
  <div class="card p-4 relative group">
    <!-- 顶部区域：名称、描述、开关 -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 pr-10">
        <h4 class="font-medium">{{ skill.name }}</h4>
        <p class="text-xs text-gray-500 mt-1">{{ skill.description }}</p>
      </div>
      <Toggle :model-value="skill.enabled" @update:model-value="(v: boolean) => emit('toggle', skill, v)" />
    </div>

    <!-- 版本和来源信息 -->
    <div class="flex items-center text-xs text-gray-400 space-x-3 mb-2">
      <span>v{{ skill.version }}</span>
      <span>来源：{{ sourceLabel }}</span>
    </div>

    <!-- 操作按钮（悬浮时显示，位于右下角） -->
    <div class="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
      <button @click="emit('edit', skill)" class="p-1.5 rounded hover:bg-gray-100" title="编辑">
        <Edit :size="16" />
      </button>
      <button @click="emit('delete', skill.id)" class="p-1.5 rounded hover:bg-gray-100" title="删除">
        <Trash :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Edit, Trash } from 'lucide-vue-next'
import Toggle from '@/components/ui/Toggle.vue'
import type { SkillConfig } from '@/api/skill'

const props = defineProps<{ skill: SkillConfig }>()
const emit = defineEmits<{
  (e: 'edit', skill: SkillConfig): void
  (e: 'toggle', skill: SkillConfig, enabled: boolean): void
  (e: 'delete', id: string): void
}>()

const sourceMap: Record<string, string> = {
  builtin: '内置',
  mcp: 'MCP',
  custom: '自定义',
}
const sourceLabel = computed(() => sourceMap[props.skill.source] || props.skill.source)
</script>
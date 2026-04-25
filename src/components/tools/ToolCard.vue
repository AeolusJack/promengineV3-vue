<template>
  <Card class="p-4 relative group">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center space-x-2">
          <h4 class="font-medium">{{ tool.name }}</h4>
          <span
            :class="[
              'text-xs px-1.5 py-0.5 rounded-tag',
              categoryColor[tool.category] || 'bg-gray-100 text-text-secondary',
            ]"
          >
            {{ categoryLabel[tool.category] || tool.category }}
          </span>
        </div>
        <p class="text-xs text-text-secondary mt-1">{{ tool.description }}</p>
      </div>
      <Toggle :model-value="tool.enabled" @update:model-value="emit('toggle', tool, $event)" />
    </div>
    <div class="mt-3 flex items-center text-xs text-text-secondary space-x-3">
      <span class="flex items-center">
        <MapPin class="w-3 h-3 mr-1" />
        {{ locationLabel[tool.location] || tool.location }}
      </span>
      <span v-if="tool.stats" class="flex items-center">
        <Activity class="w-3 h-3 mr-1" />
        调用 {{ tool.stats.totalCalls }} · 成功率 {{ (tool.stats.successRate * 100).toFixed(0) }}%
      </span>
    </div>
    <div class="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
      <button @click="emit('test', tool)" class="p-1 rounded hover:bg-hover-bg" title="测试">
        <Play class="w-4 h-4 text-text-secondary" />
      </button>
      <button @click="emit('view', tool)" class="p-1 rounded hover:bg-hover-bg" title="详情">
        <Info class="w-4 h-4 text-text-secondary" />
      </button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { MapPin, Activity, Play, Info } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Toggle from '@/components/ui/Toggle.vue'
import type { ToolInfo } from '@/api/tools'

defineProps<{ tool: ToolInfo }>()
const emit = defineEmits<{
  (e: 'toggle', tool: ToolInfo, enabled: boolean): void
  (e: 'test', tool: ToolInfo): void
  (e: 'view', tool: ToolInfo): void
}>()

const categoryLabel: Record<string, string> = {
  FILE: '文件',
  COMMAND: '命令',
  UTILITY: '工具',
  BROWSER: '浏览器',
}

const categoryColor: Record<string, string> = {
  FILE: 'bg-blue-100 text-blue-700',
  COMMAND: 'bg-orange-100 text-orange-700',
  UTILITY: 'bg-purple-100 text-purple-700',
  BROWSER: 'bg-green-100 text-green-700',
}

const locationLabel: Record<string, string> = {
  local: '本地',
  sandbox: '沙箱',
  remote: '远程',
}
</script>
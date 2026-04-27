<template>
  <div class="card p-4 relative group">
    <!-- 顶部区域：名称、描述、开关 -->
    <div class="flex items-start justify-between mb-3">
      <!-- 左侧内容区 -->
      <div class="flex-1 pr-10">
        <div class="flex items-center space-x-2">
          <h4 class="font-medium">{{ tool.name }}</h4>
          <span :class="categoryClass" class="text-xs px-2 py-0.5 rounded-tag">
            {{ categoryLabel }}
          </span>
        </div>
        <p class="text-xs text-gray-500 mt-1">{{ tool.description }}</p>
      </div>

      <!-- 开关组件（始终位于右上角） -->
      <Toggle
        :model-value="tool.enabled"
        @update:model-value="(v: boolean) => emit('toggle', tool, v)"
      />
    </div>

    <!-- 位置与统计信息 -->
    <div class="flex items-center text-xs text-gray-400 space-x-3 mb-2">
      <span>位置：{{ locationLabel }}</span>
      <span v-if="tool.stats">
        调用 {{ tool.stats.totalCalls }} 次 ·
        成功率 {{ (tool.stats.successRate * 100).toFixed(0) }}%
      </span>
    </div>

    <!-- 操作按钮（悬浮时显示，位于右下角，不会遮挡开关） -->
    <div class="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
      <button @click="emit('test', tool)" class="p-1.5 rounded hover:bg-gray-100" title="测试">
        <Play :size="16" />
      </button>
      <button @click="emit('view', tool)" class="p-1.5 rounded hover:bg-gray-100" title="详情">
        <Info :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Play, Info } from 'lucide-vue-next'
import Toggle from '@/components/ui/Toggle.vue'
import type { ToolInfo } from '@/api/tools'

const props = defineProps<{ tool: ToolInfo }>()

const emit = defineEmits<{
  (e: 'toggle', tool: ToolInfo, enabled: boolean): void
  (e: 'test', tool: ToolInfo): void
  (e: 'view', tool: ToolInfo): void
}>()

const catMap: Record<string, string> = {
  FILE: '文件', COMMAND: '命令', UTILITY: '工具', BROWSER: '浏览器',
}
const catClass: Record<string, string> = {
  FILE: 'bg-blue-100 text-blue-700', COMMAND: 'bg-orange-100 text-orange-700',
  UTILITY: 'bg-purple-100 text-purple-700', BROWSER: 'bg-green-100 text-green-700',
}
const locMap: Record<string, string> = {
  LOCAL: '本地', SANDBOX: '沙箱', REMOTE: '远程',
}

const categoryLabel = computed(() => catMap[props.tool.category] || props.tool.category)
const categoryClass = computed(() => catClass[props.tool.category] || 'bg-gray-100')
const locationLabel = computed(() => locMap[props.tool.location?.toUpperCase()] || props.tool.location)
</script>
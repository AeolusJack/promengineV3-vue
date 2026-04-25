<template>
  <Drawer :visible="true" @close="emit('close')" :title="`${tool.name} 详情`">
    <div class="space-y-4">
      <div>
        <div class="text-xs text-text-secondary mb-1">描述</div>
        <div class="text-sm">{{ tool.description }}</div>
      </div>
      <div>
        <div class="text-xs text-text-secondary mb-1">分类</div>
        <div class="text-sm">{{ tool.category }}</div>
      </div>
      <div>
        <div class="text-xs text-text-secondary mb-1">执行位置</div>
        <div class="text-sm">{{ tool.location }}</div>
      </div>
      <div>
        <div class="text-xs text-text-secondary mb-2">参数 Schema</div>
        <pre class="bg-bg-secondary p-3 rounded-card text-xs overflow-auto">{{ JSON.stringify(tool.parameters, null, 2) }}</pre>
      </div>
      <div v-if="tool.stats">
        <div class="text-xs text-text-secondary mb-2">调用统计</div>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="bg-bg-secondary p-3 rounded-card">
            <div class="text-2xl font-medium">{{ tool.stats.totalCalls }}</div>
            <div class="text-xs text-text-secondary">总调用</div>
          </div>
          <div class="bg-bg-secondary p-3 rounded-card">
            <div class="text-2xl font-medium">{{ (tool.stats.successRate * 100).toFixed(0) }}%</div>
            <div class="text-xs text-text-secondary">成功率</div>
          </div>
          <div class="bg-bg-secondary p-3 rounded-card">
            <div class="text-2xl font-medium">{{ tool.stats.avgLatencyMs }}ms</div>
            <div class="text-xs text-text-secondary">平均耗时</div>
          </div>
        </div>
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import Drawer from '@/components/ui/Drawer.vue'
import type { ToolInfo } from '@/api/tools'

defineProps<{ tool: ToolInfo }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>
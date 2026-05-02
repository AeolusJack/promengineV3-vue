<!-- src/components/memory/SourceCard.vue -->
<template>
  <div class="card p-4">
    <div class="flex items-center justify-between mb-3">
      <h4 class="font-medium">{{ title }}</h4>
      <span class="text-xs text-text-secondary">{{ hits.length }} 条命中</span>
    </div>
    <div class="space-y-2">
      <div
        v-for="(hit, idx) in hits.slice(0, 3)"
        :key="hit.id"
        class="text-sm border-b border-border-light last:border-0 pb-2 last:pb-0"
      >
        <div class="text-text-secondary text-xs mb-0.5">#{{ idx + 1 }}</div>
        <div class="truncate">{{ hit.summary || hit.content }}</div>
      </div>
      <div v-if="hits.length > 3" class="text-xs text-text-secondary">
        还有 {{ hits.length - 3 }} 条...
      </div>
      <div v-if="hits.length === 0" class="text-sm text-text-secondary">暂无命中</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MemoryEntry } from '@/types'

// 使用 withDefaults 确保 hits 永远不为 undefined
const props = withDefaults(defineProps<{
  title: string
  hits?: MemoryEntry[]
}>(), {
  hits: () => []
})
</script>
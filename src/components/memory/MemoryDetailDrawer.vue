<template>
  <Teleport to="body">
    <div v-if="memory" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-black/20" @click="emit('close')"></div>
      <div class="relative w-[480px] h-full bg-white shadow-xl overflow-auto">
        <div class="sticky top-0 bg-white border-b border-border-light px-5 py-4 flex items-center justify-between">
          <h3 class="font-medium">记忆详情</h3>
          <button @click="emit('close')" class="p-1 rounded hover:bg-hover-bg">
            <X class="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        <div class="p-5 space-y-4">
          <div>
            <div class="text-xs text-text-secondary mb-1">ID</div>
            <div class="font-mono text-sm">{{ memory.id }}</div>
          </div>
          <div>
            <div class="text-xs text-text-secondary mb-1">内容</div>
            <div class="text-sm whitespace-pre-wrap bg-bg-secondary p-3 rounded-card">{{ memory.content }}</div>
          </div>
          <div>
            <div class="text-xs text-text-secondary mb-1">摘要</div>
            <div class="text-sm">{{ memory.summary || '-' }}</div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-text-secondary mb-1">层级</div>
              <div class="text-sm">{{ memory.layer }}</div>
            </div>
            <div>
              <div class="text-xs text-text-secondary mb-1">域</div>
              <div class="text-sm">{{ memory.domain }}</div>
            </div>
            <div>
              <div class="text-xs text-text-secondary mb-1">强度</div>
              <div class="text-sm">{{ ((memory.strength ?? 0) * 100).toFixed(0) }}%</div>
            </div>
            <div>
              <div class="text-xs text-text-secondary mb-1">效用评分</div>
              <div class="text-sm">{{ (memory.utilityScore ?? 0).toFixed(2) }}</div>
            </div>
            <div>
              <div class="text-xs text-text-secondary mb-1">安全评分</div>
              <div class="text-sm">{{ (memory.safetyScore ?? 0).toFixed(2) }}</div>
            </div>
            <div>
              <div class="text-xs text-text-secondary mb-1">检索次数</div>
              <div class="text-sm">{{ memory.metadata?.retrievalCount || 0 }}</div>
            </div>
          </div>
          <div>
            <div class="text-xs text-text-secondary mb-1">元数据</div>
            <pre class="text-xs bg-bg-secondary p-3 rounded-card overflow-auto max-h-64">{{ JSON.stringify(memory.metadata, null, 2) }}</pre>
          </div>
          <div class="pt-4 border-t border-border-light">
            <button
              @click="emit('convert', memory.id)"
              class="btn-primary w-full"
            >
              转化为过程记忆
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { MemoryEntry } from '@/types'

const props = defineProps<{ memory: MemoryEntry | null }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'convert', id: string): void
}>()
</script>
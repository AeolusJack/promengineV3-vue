<template>
  <div class="flex justify-start">
    <div class="max-w-[80%] bg-white border border-border-light rounded-card px-4 py-3">
      <div class="text-sm whitespace-pre-wrap break-words">
        <div v-if="thinkingLines.length" class="mb-2">
          <div class="text-xs text-text-secondary font-medium mb-1">思考过程</div>
          <div class="text-xs text-text-secondary italic max-h-24 overflow-y-auto p-1">
            <div v-for="(line, idx) in thinkingLines" :key="'th-'+idx">{{ line }}</div>
          </div>
        </div>
        <div>{{ displayText }}</div>
        <span v-if="isStreaming" class="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-text-bottom"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'

const props = defineProps<{
  /** 原始增量文本（可能包含 [思考] 标记） */
  token: string
  /** 是否仍在流中 */
  isStreaming: boolean
}>()

const rawTokens = ref<string[]>([])

// 当外部 token 属性变化时，追加到内部数组
watch(() => props.token, (newToken) => {
  if (newToken && props.isStreaming) {
    rawTokens.value.push(newToken)
  }
})

// 父组件外部强制清空
const clear = () => {
  rawTokens.value = []
}
defineExpose({ clear, displayText })

// 计算思考内容行
const thinkingLines = computed(() => {
  const lines: string[] = []
  for (const t of rawTokens.value) {
    if (t.startsWith('[思考] ')) {
      lines.push(t.slice(4))
    }
  }
  return lines
})

// 计算最终显示文本（过滤思考标记，并拼接）
const displayText = computed(() => {
  return rawTokens.value
    .filter(t => !t.startsWith('[思考] '))
    .join('')
})

onUnmounted(() => {
  rawTokens.value = []
})
</script>
<template>
  <div class="flex justify-start">
    <div class="max-w-[80%] bg-white border border-border-light rounded-card px-4 py-3">
      <!-- 思考区域 -->
      <div v-if="thinkingLines.length > 0" class="mb-2">
        <div class="text-xs text-text-secondary font-medium mb-1">
          {{ $t('thinking.process') }}
        </div>
        <div class="text-xs text-text-secondary italic max-h-24 overflow-y-auto p-1">
          <div v-for="(line, idx) in thinkingLines" :key="'th-' + idx">
            {{ line }}
          </div>
        </div>
      </div>

      <!-- 正式回答（Markdown 渲染，每次都基于全量文本） -->
      <div
        class="text-sm prose prose-sm max-w-none"
        v-html="safeHtml"
      ></div>

      <!-- 光标动画 -->
      <span
        v-if="isStreaming"
        class="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-text-bottom"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps<{
  token: string
  isStreaming: boolean
}>()

const { t } = useI18n()
const rawTokens = ref<string[]>([])

// 收集所有 token
watch(
  () => props.token,
  (newToken) => {
    if (newToken && props.isStreaming) {
      rawTokens.value.push(newToken)
    }
  }
)

// 暴露清空方法，供父组件在切换会话时使用
const clear = () => {
  rawTokens.value = []
}
defineExpose({ clear })

// 思考文本
const thinkingLines = computed(() => {
  return rawTokens.value
    .filter(t => t.startsWith('[思考]'))
    .map(t => t.slice(4).trim())
})

// 正式回答全文
const displayText = computed(() => {
  return rawTokens.value
    .filter(t => !t.startsWith('[思考]'))
    .join('')
})

// 将全量文本渲染为 HTML
const safeHtml = computed(() => renderMarkdown(displayText.value))

onUnmounted(() => {
  rawTokens.value = []
})
</script>
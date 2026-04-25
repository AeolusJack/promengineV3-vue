<template>
  <div :class="['flex', message.role === 'user' ? 'justify-end' : 'justify-start']">
    <div class="relative max-w-[80%] group">
      <div
        :class="[
          'px-4 py-3 rounded-card border',
          message.role === 'user'
            ? 'bg-blue-50 border-transparent'
            : 'bg-white border-border-light',
        ]"
      >
        <div class="whitespace-pre-wrap break-words text-sm">{{ message.content }}</div>
        <div v-if="message.role === 'assistant'" class="mt-2">
          <button
            @click="showThinking = !showThinking"
            class="text-xs text-text-secondary hover:text-primary flex items-center"
          >
            <Brain class="w-3 h-3 mr-1" />
            思考轨迹
          </button>
          <div v-if="showThinking" class="mt-3 pt-3 border-t border-border-light text-xs space-y-1">
            <div class="text-text-secondary">
              记忆检索：{{ message.thinkingTrace?.memoriesRetrieved || 0 }} 条
            </div>
            <div v-if="message.toolCalls?.length">
              <div class="text-text-secondary mb-1">工具调用：</div>
              <div v-for="tc in message.toolCalls" :key="tc.name" class="ml-2">
                <span class="font-mono text-primary">{{ tc.name }}</span>
                <span class="text-text-secondary ml-1">{{ formatArgs(tc.arguments) }}</span>
                <div v-if="tc.result" class="text-green-600 truncate">→ {{ tc.result }}</div>
              </div>
            </div>
            <div v-if="message.thinkingTrace?.rippleEvents?.length">
              <RippleChart :events="message.thinkingTrace.rippleEvents" />
            </div>
          </div>
        </div>
      </div>
      <!-- 操作菜单 -->
      <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <ContentActionMenu
          :content="message.content"
          :message-id="message.id"
          @save-to-memory="emit('saveToMemory', $event)"
          @export-image="emit('exportImage', $event)"
          @export-pdf="emit('exportPdf', $event)"
          @share="emit('share', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Brain } from 'lucide-vue-next'
import type { Message } from '@/types'
import ContentActionMenu from './ContentActionMenu.vue'
import RippleChart from './RippleChart.vue'

const props = defineProps<{
  message: Message
}>()

const emit = defineEmits<{
  (e: 'saveToMemory', content: string): void
  (e: 'exportImage', content: string): void
  (e: 'exportPdf', content: string): void
  (e: 'share', messageId: string): void
}>()

const showThinking = ref(false)

const formatArgs = (args: Record<string, any>) => {
  const str = JSON.stringify(args)
  return str.length > 60 ? str.slice(0, 60) + '…' : str
}
</script>
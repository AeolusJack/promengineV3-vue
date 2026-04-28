<template>
  <div class="flex h-full">
    <!-- ========== 左侧：对话主区域 ========== -->
    <div class="flex-1 flex flex-col min-w-0 pr-4">
      <!-- 顶部栏 -->
      <div class="flex items-center justify-between mb-4">
        <input
          v-model="currentSessionName"
          @blur="saveSessionName"
          :placeholder="$t('chat.sessionDefaultName')"
          class="text-lg font-medium bg-transparent border-none outline-none p-0"
        />
        <div class="flex items-center space-x-3">
          <!-- 流式模式切换 -->
          <div class="flex items-center space-x-2">
            <span class="text-xs text-text-secondary">{{ $t('chat.streamMode') }}</span>
            <Toggle v-model="streamMode" />
          </div>
          <button @click="toggleSidebar" class="btn-secondary text-sm px-3 py-1.5">
            {{ sidebarOpen ? $t('chat.hideHistory') : $t('chat.showHistory') }}
          </button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="flex-1 overflow-y-auto space-y-4 pr-2" ref="messageContainer">
        <MessageBubble
          v-for="msg in messages"
          :key="msg.id"
          :message="msg"
          @save-to-memory="handleSaveToMemory"
          @export-image="handleExportImage"
          @export-pdf="handleExportPdf"
          @share="handleShare"
        />

        <!-- 流式实时渲染 -->
        <StreamingMessage
          v-if="isStreaming"
          ref="streamingRef"
          :token="streamingToken"
          :is-streaming="isStreaming"
        />

        <!-- 非流式加载中 -->
        <div v-if="isLoading && !isStreaming" class="flex justify-start">
          <div class="bg-white border border-border-light rounded-card px-4 py-3">
            <div class="text-sm text-text-secondary">{{ $t('chat.thinking') }}</div>
          </div>
        </div>
      </div>

      <!-- 思维涟漪 -->
      <div class="flex items-center justify-center mb-2">
        <div class="bg-white border border-border-light rounded-full px-3 py-1.5 shadow-card flex items-center space-x-2">
          <span class="text-xs text-text-secondary">{{ $t('chat.rippleTitle') }}</span>
          <RippleChart :events="rippleEvents" />
        </div>
      </div>

      <!-- 输入框 -->
      <div class="border-t border-border-light pt-4">
        <div class="flex items-end space-x-3">
          <textarea
            v-model="inputText"
            @keydown.enter.exact.prevent="handleSend"
            :placeholder="$t('chat.inputPlaceholder')"
            rows="1"
            class="flex-1 resize-none max-h-32 min-h-[44px] p-3 border border-border-light rounded-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          ></textarea>
          <button
            @click="handleSend"
            :disabled="!inputText.trim() || isStreaming || isLoading"
            class="btn-primary px-6 py-3 disabled:opacity-50"
          >
            {{ $t('chat.send') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ========== 右侧：历史会话列表 ========== -->
    <transition name="slide">
      <div v-if="sidebarOpen" class="w-56 pl-4 border-l border-border-light overflow-y-auto flex-shrink-0">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs text-text-secondary uppercase tracking-wider">{{ $t('chat.history') }}</span>
          <button @click="newSession" class="text-primary text-xl leading-4" :title="$t('chat.newSession')">+</button>
        </div>
        <div class="space-y-1">
          <button
            v-for="session in sessions"
            :key="session.id"
            @click="switchSession(session.id)"
            :class="[
              'w-full text-left px-3 py-2 rounded-button text-sm truncate',
              session.id === currentSessionId
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-text-secondary hover:bg-hover-bg',
            ]"
          >
            {{ session.name }}
          </button>
        </div>
        <div v-if="sessions.length === 0" class="text-xs text-text-secondary mt-2">
          {{ $t('chat.noHistory') }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '@/stores/chat'
import { useWebSocket } from '@/composables/useWebSocket'
import { memoryApi } from '@/api/memory'
import { chatApi } from '@/api/chat'
import MessageBubble from '@/components/chat/MessageBubble.vue'
import StreamingMessage from '@/components/chat/StreamingMessage.vue'
import RippleChart from '@/components/chat/RippleChart.vue'
import Toggle from '@/components/ui/Toggle.vue'

const { t } = useI18n()
const chatStore = useChatStore()
const { sessions, currentSessionId, messages, isLoading } = storeToRefs(chatStore)

const inputText = ref('')
const streamMode = ref(true)
const sidebarOpen = ref(true)
const messageContainer = ref<HTMLElement>()

const isStreaming = ref(false)
const streamingToken = ref('')
const streamingRef = ref<InstanceType<typeof StreamingMessage> | null>(null)

let abortController: AbortController | null = null

const { rippleEvents, connect: connectRipple, disconnect: disconnectRipple } = useWebSocket()

// 当前会话名称
const currentSessionName = computed({
  get() {
    const session = sessions.value.find(s => s.id === currentSessionId.value)
    return session?.name || t('chat.sessionDefaultName')
  },
  set(val: string) {
    const session = sessions.value.find(s => s.id === currentSessionId.value)
    if (session) session.name = val
  },
})

const saveSessionName = () => {
  if (currentSessionId.value && currentSessionName.value) {
    chatStore.updateSessionName(currentSessionId.value, currentSessionName.value)
  }
}

watch(currentSessionId, (newId) => {
  disconnectRipple()
  if (newId) connectRipple(newId)
}, { immediate: true })

const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}
watch(() => messages.value.length, scrollToBottom)
watch(streamingToken, () => {
  if (isStreaming.value) scrollToBottom()
})

onMounted(async () => {
  await chatStore.fetchSessions()
  if (!currentSessionId.value && sessions.value.length > 0) {
    await chatStore.switchSession(sessions.value[0].id)
  } else if (!currentSessionId.value) {
    chatStore.initSession()
  }
})

onUnmounted(() => {
  if (abortController) abortController.abort()
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
const newSession = () => {
  chatStore.initSession()
  streamingToken.value = ''
  clearStreaming()
}
const switchSession = (id: string) => {
  chatStore.switchSession(id)
  streamingToken.value = ''
  clearStreaming()
}

const clearStreaming = () => {
  streamingRef.value?.clear()
}

// ---------- 发送 ----------
const handleSend = async () => {
  const text = inputText.value.trim()
  if (!text || isStreaming.value || isLoading.value) return

  const sessionId = chatStore.currentSessionId || chatStore.initSession()
  const userMsg = {
    id: crypto.randomUUID(),
    role: 'user' as const,
    content: text,
    timestamp: Date.now(),
  }
  chatStore.messagesMap[sessionId] = [...(chatStore.messagesMap[sessionId] || []), userMsg]
  inputText.value = ''

  if (streamMode.value) {
    await sendStream(sessionId, text)
  } else {
    await sendNonStream(sessionId, text)
  }

  if ((chatStore.messagesMap[sessionId]?.length || 0) <= 2) {
    const autoName = text.length > 20 ? text.slice(0, 20) + '…' : text
    await chatStore.updateSessionName(sessionId, autoName)
  }
}

// ---------- 流式 SSE ----------
const sendStream = async (sessionId: string, text: string) => {
  isStreaming.value = true
  streamingToken.value = ''
  clearStreaming()

  abortController = new AbortController()
  const signal = abortController.signal

  try {
    const response = await fetch('/api/v1/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': localStorage.getItem('userId') || 'default-user',
      },
      body: JSON.stringify({ sessionId, message: text }),
      signal,
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const reader = response.body?.getReader()
    if (!reader) throw new Error('No reader')

    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop() || ''

      for (const event of events) {
        if (!event.trim()) continue
        const lines = event.split('\n')
        const dataLines: string[] = []
        for (const line of lines) {
          if (line.startsWith('data: ')) dataLines.push(line.slice(6))
          else if (line.startsWith('data:')) dataLines.push(line.slice(5))
        }
        const dataStr = dataLines.join('\n')
        if (dataStr === '[DONE]') continue
        if (dataStr) {
          const token = extractToken(dataStr.trim())
          if (token) {
            fullContent += token
            streamingToken.value = token
          }
        }
      }
    }

    // 处理剩余 buffer
    if (buffer.trim()) {
      const lines = buffer.split('\n')
      const dataLines: string[] = []
      for (const line of lines) {
        if (line.startsWith('data: ')) dataLines.push(line.slice(6))
        else if (line.startsWith('data:')) dataLines.push(line.slice(5))
      }
      const dataStr = dataLines.join('\n')
      if (dataStr && dataStr !== '[DONE]') {
        const token = extractToken(dataStr.trim())
        if (token) {
          fullContent += token
          streamingToken.value = token
        }
      }
    }

    // 流结束 -> 保存完整助手消息
    const assistantMsg = {
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      content: fullContent.trim() || t('chat.emptyResponse'),
      timestamp: Date.now(),
    }
    chatStore.messagesMap[sessionId] = [
      ...(chatStore.messagesMap[sessionId] || []),
      assistantMsg,
    ]
  } catch (err: any) {
    if (err.name === 'AbortError') return
    console.error('Stream error:', err)
    chatStore.messagesMap[sessionId] = [
      ...(chatStore.messagesMap[sessionId] || []),
      {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: t('chat.errorMessage'),
        timestamp: Date.now(),
      },
    ]
  } finally {
    isStreaming.value = false
    abortController = null
  }
}

const extractToken = (raw: string): string => {
  try {
    const obj = JSON.parse(raw)
    if (typeof obj === 'object' && obj !== null) {
      if (obj.content) return obj.content
      if (obj.choices?.[0]?.delta?.content) return obj.choices[0].delta.content
      if (obj.choices?.[0]?.text) return obj.choices[0].text
    }
    return raw
  } catch {
    return raw
  }
}

// ---------- 非流式 ----------
const sendNonStream = async (sessionId: string, text: string) => {
  isLoading.value = true
  try {
    const res = await chatApi.send({ sessionId, message: text })
    const assistantMsg = {
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      content: res.data.text,
      timestamp: Date.now(),
    }
    chatStore.messagesMap[sessionId] = [
      ...(chatStore.messagesMap[sessionId] || []),
      assistantMsg,
    ]
  } catch (err) {
    console.error('Non-stream error:', err)
    chatStore.messagesMap[sessionId] = [
      ...(chatStore.messagesMap[sessionId] || []),
      {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: t('chat.errorMessage'),
        timestamp: Date.now(),
      },
    ]
  } finally {
    isLoading.value = false
  }
}

// ---------- 记忆 / 导出 / 分享 ----------
const handleSaveToMemory = async (content: string) => {
  try {
    await memoryApi.remember(content, { source: 'chat', sessionId: currentSessionId.value })
    alert(t('chat.memorySaved'))
  } catch (e) {
    console.error('Save memory failed', e)
  }
}

const handleExportImage = async () => {
  if (!messageContainer.value) return
  const html2canvas = (await import('html2canvas')).default
  const canvas = await html2canvas(messageContainer.value)
  const link = document.createElement('a')
  link.download = `chat-${Date.now()}.png`
  link.href = canvas.toDataURL()
  link.click()
}

const handleExportPdf = async () => {
  if (!messageContainer.value) return
  const html2canvas = (await import('html2canvas')).default
  const jsPDF = (await import('jspdf')).default
  const canvas = await html2canvas(messageContainer.value)
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] })
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
  pdf.save(`chat-${Date.now()}.pdf`)
}

const handleShare = (messageId: string) => {
  const shareUrl = `${window.location.origin}/share/chat/${currentSessionId.value}#${messageId}`
  navigator.clipboard?.writeText(shareUrl)
  alert(t('chat.shareCopied'))
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: width 0.2s ease, opacity 0.2s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  width: 0;
  opacity: 0;
}
</style>
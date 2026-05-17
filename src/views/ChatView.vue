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
          <!-- Agent 选择器 -->
          <select
            v-model="selectedAgentId"
            class="border border-border-light rounded-button px-3 py-1.5 text-sm bg-white focus:outline-none"
          >
            <option value="">{{ $t('chat.defaultAssistant') }}</option>
            <option v-for="agent in agentList" :key="agent.id" :value="agent.id">
              {{ agent.name }}
            </option>
          </select>
          <!-- 流式模式切换 -->
          <div class="flex items-center space-x-2">
            <span class="text-xs text-text-secondary">{{ $t('chat.streamMode') }}</span>
            <Toggle v-model="streamMode" />
          </div>
          <!-- 执行过程面板开关 -->
          <button @click="showFlowChart = !showFlowChart" class="btn-secondary text-sm px-3 py-1.5">
            {{ showFlowChart ? $t('chat.hideProcess') : $t('chat.showProcess') }}
          </button>
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
          @show-execution="handleShowExecution"
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

    <!-- ========== 右侧执行过程面板 ========== -->
    <div v-if="showFlowChart" class="w-72 pl-4 border-l overflow-y-auto">
      <ReActFlowChart
        :execution-id="currentViewExecutionId"
        ref="flowChartRef"
      />
    </div>
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
import { agentApi } from '@/api/agent'
import MessageBubble from '@/components/chat/MessageBubble.vue'
import StreamingMessage from '@/components/chat/StreamingMessage.vue'
import RippleChart from '@/components/chat/RippleChart.vue'
import Toggle from '@/components/ui/Toggle.vue'
import ReActFlowChart from '@/components/flow/ReActFlowChart.vue'
import { v4 as uuidv4 } from 'uuid'
import client from '@/api/client'

const { t } = useI18n()
const chatStore = useChatStore()
const { sessions, currentSessionId, isLoading } = storeToRefs(chatStore)

const messages = computed(() => {
  const id = currentSessionId.value
  return id ? (chatStore.messagesMap[id] || []) : []
})

const { rippleEvents, connect: connectRipple, disconnect: disconnectRipple, on, off } = useWebSocket()

const flowChartRef = ref<any>(null)
const streamingRef = ref<any>(null)

const showFlowChart = ref(true)
const currentViewExecutionId = ref<string | null>(null)
const latestExecutionId = ref<string | null>(null)
const executionStepsMap = ref<Record<string, any[]>>({})

const inputText = ref('')
const streamMode = ref(true)
const sidebarOpen = ref(true)
const messageContainer = ref<HTMLElement | null>(null)

const selectedAgentId = ref('')
const agentList = ref<{ id: string; name: string }[]>([])

const isStreaming = ref(false)
const streamingToken = ref('')
let abortController: AbortController | null = null

// ===================== WebSocket 事件处理 =====================
on('react_step', (data: any) => {
  const event = data?.data
  if (!event || !event.executionId) return
  const eid = event.executionId

  if (!executionStepsMap.value[eid]) {
    executionStepsMap.value[eid] = []
  }
  const exists = executionStepsMap.value[eid].some(
    s => s.type === event.type && s.stepNumber === event.stepNumber && s.timestamp === event.timestamp
  )
  if (!exists) {
    executionStepsMap.value[eid].push(event)
  }

  if (showFlowChart.value && !currentViewExecutionId.value) {
    currentViewExecutionId.value = eid
  }

  if (currentViewExecutionId.value === eid && flowChartRef.value) {
    flowChartRef.value.addStep(event)
  }
})

on('review_request', (data: any) => {
  const { reviewId, request } = data
  if (confirm(`请求: ${request.title}\n内容: ${request.content}`)) {
    fetch(`/api/v1/reviews/${reviewId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'approve' })
    })
  } else {
    fetch(`/api/v1/reviews/${reviewId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'reject' })
    })
  }
})

// ===================== 会话管理 =====================
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

// ===================== 自动滚动 =====================
const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}
watch(messages, () => { nextTick(() => scrollToBottom()) }, { deep: true })
watch(streamingToken, () => { if (isStreaming.value) scrollToBottom() })

// ===================== 会话操作 =====================
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

const handleShowExecution = (executionId: string) => {
  currentViewExecutionId.value = executionId
  showFlowChart.value = true
}

// ===================== 面板状态持久化 =====================
const savePanelState = async (visible: boolean) => {
  try {
    await client.put('/settings', { showExecutionPanel: visible })
  } catch (e) {
    console.error('保存面板状态失败', e)
  }
}

watch(showFlowChart, (val) => {
  savePanelState(val)
})

// ===================== 发送消息 =====================
const handleSend = async () => {
  const text = inputText.value.trim()
  if (!text || isStreaming.value || isLoading.value) return
  if (!currentSessionId.value) chatStore.initSession()
  const sessionId = currentSessionId.value!

  await connectRipple(sessionId)

  const executionId = uuidv4()
  const userMsg = {
    id: uuidv4(),
    role: 'user' as const,
    content: text,
    timestamp: Date.now(),
    executionId,
  }
  chatStore.messagesMap[sessionId] = [...(chatStore.messagesMap[sessionId] || []), userMsg]
  inputText.value = ''

  const agentId = selectedAgentId.value || undefined
  if (streamMode.value) {
    await sendStream(sessionId, text, agentId, executionId)
  } else {
    await sendNonStream(sessionId, text, agentId, executionId)
  }

  if ((chatStore.messagesMap[sessionId]?.length || 0) <= 2) {
    const autoName = text.length > 20 ? text.slice(0, 20) + '…' : text
    await chatStore.updateSessionName(sessionId, autoName)
  }
}

// ===================== 流式发送 =====================
const sendStream = async (sessionId: string, text: string, agentId?: string, executionId?: string) => {
  isStreaming.value = true
  streamingToken.value = ''
  clearStreaming()
  abortController = new AbortController()
  const signal = abortController.signal

  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null
  let fullContent = ''
  let doneReceived = false
  let firstDataReceived = false
  let idleTimer: ReturnType<typeof setTimeout> | null = null
  let globalTimeout: ReturnType<typeof setTimeout> | null = null
  let saved = false

  const clearIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer)
    idleTimer = null
  }

  const startIdleTimer = () => {
    clearIdleTimer()
    idleTimer = setTimeout(() => {
      if (!doneReceived && firstDataReceived) {
        console.warn('30秒无新数据，主动中断，保留已接收内容')
        abortController?.abort()
      }
    }, 300000)
  }

  const saveContentIfNeeded = (content: string) => {
    if (saved) return
    saved = true
    const finalContent = content.trim() || t('chat.emptyResponse')
    const assistantMsg = {
      id: uuidv4(),
      role: 'assistant' as const,
      content: finalContent,
      timestamp: Date.now(),
      executionId,
    }
    chatStore.messagesMap[sessionId] = [...(chatStore.messagesMap[sessionId] || []), assistantMsg]
  }

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const token = localStorage.getItem('token')
    if (token) headers['Authorization'] = `Bearer ${token}`
    else headers['X-User-Id'] = 'default-user'

    const body = JSON.stringify({ sessionId, message: text, agentId, executionId })
    const response = await fetch('/api/v1/chat/stream', {
      method: 'POST',
      headers,
      body,
      signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    reader = response.body!.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    globalTimeout = setTimeout(() => {
      if (!firstDataReceived && !doneReceived) {
        console.warn('连接后60秒无任何数据，中断')
        abortController?.abort()
      }
    }, 600000)

    while (!doneReceived) {
      const { done, value } = await reader.read()
      if (done) {
        console.warn('连接正常关闭，未收到[DONE]')
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop() || ''

      for (const event of events) {
        const lines = event.split('\n')
        let dataStr = ''
        for (const line of lines) {
          if (line.startsWith('data: ')) dataStr = line.slice(6).trim()
          else if (line.startsWith('data:')) dataStr = line.slice(5).trim()
          if (dataStr) break
        }
        if (!dataStr) continue

        if (dataStr === '[DONE]') {
          doneReceived = true
          break
        }

        if (!firstDataReceived) {
          firstDataReceived = true
          if (globalTimeout) clearTimeout(globalTimeout)
        }
        startIdleTimer()

        const token = extractToken(dataStr)
        if (token) {
          fullContent += token
          streamingToken.value = token
        }
      }
    }

    saveContentIfNeeded(fullContent)
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.warn('流式连接被主动中断')
      if (fullContent) saveContentIfNeeded(fullContent)
    } else {
      console.error('流式错误:', err)
      if (fullContent) {
        saveContentIfNeeded(fullContent)
      } else {
        const assistantMsg = {
          id: uuidv4(),
          role: 'assistant' as const,
          content: t('chat.errorMessage'),
          timestamp: Date.now(),
          executionId,
        }
        chatStore.messagesMap[sessionId] = [...(chatStore.messagesMap[sessionId] || []), assistantMsg]
      }
    }
  } finally {
    clearIdleTimer()
    if (globalTimeout) clearTimeout(globalTimeout)
    if (reader) {
      try { await reader.cancel() } catch(e) {}
    }
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

// ===================== 非流式 =====================
const sendNonStream = async (sessionId: string, text: string, agentId?: string, executionId?: string) => {
  isLoading.value = true
  try {
    const payload: any = { sessionId, message: text, agentId }
    if (executionId) payload.executionId = executionId
    const res = await chatApi.send(payload)
    const assistantMsg = {
      id: uuidv4(),
      role: 'assistant' as const,
      content: res.data.text,
      timestamp: Date.now(),
      executionId,
    }
    chatStore.messagesMap[sessionId] = [...(chatStore.messagesMap[sessionId] || []), assistantMsg]
  } catch (err) {
    console.error('Non-stream error:', err)
    chatStore.messagesMap[sessionId] = [
      ...(chatStore.messagesMap[sessionId] || []),
      { id: uuidv4(), role: 'assistant' as const, content: t('chat.errorMessage'), timestamp: Date.now(), executionId }
    ]
  } finally {
    isLoading.value = false
  }
}

// ===================== 记忆/导出/分享 =====================
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

// ===================== 生命周期 =====================
onMounted(async () => {
  await chatStore.fetchSessions()
  if (!currentSessionId.value && sessions.value.length > 0) {
    await chatStore.switchSession(sessions.value[0].id)
  } else if (!currentSessionId.value) {
    chatStore.initSession()
  }

  try {
    const res = await client.get('/config', {
      params: { userId: localStorage.getItem('userId') || 'default-user' }
    })
    const data = res.data
    if (data.success && data.data?.settings?.showExecutionPanel !== undefined) {
      showFlowChart.value = data.data.settings.showExecutionPanel
    }
  } catch (e) {}

  try {
    const res = await agentApi.list()
    const data = res.data?.data || res.data || []
    agentList.value = data.map((a: any) => ({ id: a.id, name: a.name }))
  } catch (e) {
    console.error('获取 Agent 列表失败', e)
  }
})

onUnmounted(() => {
  if (abortController) abortController.abort()
  off('react_step')
  off('review_request')
})
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
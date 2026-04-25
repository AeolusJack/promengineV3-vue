<template>
  <div class="flex h-full">
    <!-- 左侧：对话主区域 -->
    <div class="flex-1 flex flex-col min-w-0 pr-4">
      <!-- 顶部栏 -->
      <div class="flex items-center justify-between mb-4">
        <input
          v-model="currentSessionName"
          placeholder="会话名称"
          class="text-lg font-medium bg-transparent border-none outline-none p-0"
        />
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-1">
            <span class="text-sm text-text-secondary">工具</span>
            <Toggle v-model="toolsEnabled" />
          </div>
          <button @click="toggleSidebar" class="btn-secondary text-sm px-3 py-1.5">
            {{ sidebarOpen ? '隐藏历史' : '历史会话' }}
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
        <div v-if="isLoading" class="flex justify-start">
          <div class="bg-white border border-border-light rounded-card px-4 py-3">
            <div class="flex space-x-1">
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="mt-4 border-t border-border-light pt-4">
        <div class="flex items-end space-x-3">
          <textarea
            v-model="inputText"
            @keydown.enter.exact.prevent="handleSend"
            placeholder="输入消息... (Enter 发送)"
            rows="1"
            class="flex-1 resize-none max-h-32 min-h-[44px] p-3 border border-border-light rounded-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          ></textarea>
          <button
            @click="handleSend"
            :disabled="!inputText.trim() || isLoading"
            class="btn-primary px-6 py-3 disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </div>
    </div>

    <!-- 右侧：历史会话列表（可折叠） -->
    <transition name="slide">
      <div v-if="sidebarOpen" class="w-56 pl-4 border-l border-border-light overflow-y-auto flex-shrink-0">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs text-text-secondary uppercase tracking-wider">历史会话</span>
          <button @click="newSession" class="text-primary text-xl leading-4" title="新建会话">+</button>
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
          暂无历史会话
        </div>
      </div>
    </transition>

    <!-- 思维涟漪 -->
    <div class="fixed bottom-6 right-6 bg-white border border-border-light rounded-full px-3 py-1.5 shadow-card flex items-center space-x-2 z-10">
      <span class="text-xs text-text-secondary">思维涟漪</span>
      <RippleChart :events="rippleEvents" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { useWebSocket } from '@/composables/useWebSocket'
import { memoryApi } from '@/api/memory'
import MessageBubble from '@/components/MessageBubble.vue'
import RippleChart from '@/components/RippleChart.vue'
import Toggle from '@/components/ui/Toggle.vue'

const chatStore = useChatStore()
const { sessions, currentSessionId, messages, isLoading } = storeToRefs(chatStore)

const inputText = ref('')
const toolsEnabled = ref(true)
const sidebarOpen = ref(true)
const messageContainer = ref<HTMLElement>()

const { rippleEvents, connect: connectRipple, disconnect: disconnectRipple } = useWebSocket()

// 当前会话名称（双向绑定）
const currentSessionName = computed({
  get() {
    const session = sessions.value.find(s => s.id === currentSessionId.value)
    return session?.name || '新会话'
  },
  set(val: string) {
    const session = sessions.value.find(s => s.id === currentSessionId.value)
    if (session) session.name = val
  },
})

// WebSocket 跟随 sessionId 变化
watch(currentSessionId, (newId) => {
  disconnectRipple()
  if (newId) {
    connectRipple(newId)
  }
}, { immediate: true })

// 自动滚动到底部
watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  },
  { immediate: true }
)

// 页面加载时自动获取会话列表
onMounted(async () => {
  await chatStore.fetchSessions()
  if (!currentSessionId.value && sessions.value.length > 0) {
    await chatStore.switchSession(sessions.value[0].id)
  } else if (!currentSessionId.value) {
    chatStore.initSession()
  }
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const newSession = () => {
  chatStore.initSession()
}

const switchSession = (id: string) => {
  chatStore.switchSession(id)
}

const handleSend = () => {
  if (!inputText.value.trim()) return
  chatStore.sendMessage(inputText.value.trim())
  inputText.value = ''
}

const handleSaveToMemory = async (content: string) => {
  try {
    await memoryApi.remember(content, { source: 'chat', sessionId: currentSessionId.value })
    alert('已存入记忆')
  } catch (e) {
    console.error('Failed to save memory', e)
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
  alert('分享链接已复制到剪贴板')
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
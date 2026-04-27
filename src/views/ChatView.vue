<template>
  <div class="flex h-full">
    <!-- 左侧：对话主区域 -->
    <div class="flex-1 flex flex-col min-w-0 pr-4">
      <div class="flex items-center justify-between mb-4">
        <input v-model="sessionName" @blur="saveName" placeholder="会话名称"
               class="text-lg font-medium bg-transparent border-none outline-none p-0" />
        <button @click="toggleHistory" class="btn-secondary text-sm px-3 py-1.5">
          {{ showHistory ? '隐藏历史' : '历史会话' }}
        </button>
      </div>

      <!-- 消息列表 -->
      <div class="flex-1 overflow-y-auto space-y-4 pr-2" ref="msgContainer">
        <div v-for="msg in messages" :key="msg.id"
             :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
          <div :class="msg.role === 'user' ? 'bg-blue-50' : 'bg-white border'"
               class="max-w-[80%] px-4 py-3 rounded-card text-sm whitespace-pre-wrap break-words">
            {{ msg.content }}
          </div>
        </div>
        <div v-if="loading" class="flex justify-start">
          <div class="bg-white border rounded-card px-4 py-3">
            <span class="text-gray-400">正在思考...</span>
          </div>
        </div>
      </div>

      <div class="border-t pt-4">
        <div class="flex items-end space-x-3">
          <textarea v-model="inputText" @keydown.enter.exact.prevent="send" placeholder="输入消息..."
                    class="flex-1 resize-none min-h-[44px] p-3 border rounded-card"
                    :disabled="loading"></textarea>
          <button @click="send" :disabled="!inputText.trim() || loading"
                  class="btn-primary px-6 py-3 disabled:opacity-50">发送</button>
        </div>
      </div>
    </div>

    <!-- 右侧历史会话 -->
    <div v-if="showHistory" class="w-56 pl-4 border-l overflow-y-auto">
      <button v-for="s in sessions" :key="s.id" @click="switchSession(s.id)"
              :class="['block w-full text-left px-3 py-2 rounded-button text-sm truncate',
                       s.id === currentSessionId ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50']">
        {{ s.name }}
      </button>
      <button @click="newChat" class="text-blue-500 mt-2">+ 新会话</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { useWebSocket } from '@/composables/useWebSocket'
import RippleChart from '@/components/RippleChart.vue'

const chatStore = useChatStore()
const { sessions, currentSessionId, messages, isLoading: loading } = storeToRefs(chatStore)

const inputText = ref('')
const showHistory = ref(true)
const msgContainer = ref<HTMLElement>()

const sessionName = computed({
  get: () => sessions.value.find(s => s.id === currentSessionId.value)?.name || '新会话',
  set: (v) => { const s = sessions.value.find(s => s.id === currentSessionId.value); if (s) s.name = v }
})
const saveName = () => { if (currentSessionId.value) chatStore.updateSessionName(currentSessionId.value, sessionName.value) }

const scrollBottom = () => nextTick(() => { if (msgContainer.value) msgContainer.value.scrollTop = msgContainer.value.scrollHeight })
watch(() => messages.value.length, scrollBottom)

onMounted(async () => {
  await chatStore.fetchSessions()
  if (!currentSessionId.value && sessions.value.length > 0) await chatStore.switchSession(sessions.value[0].id)
  else if (!currentSessionId.value) chatStore.initSession()
})

const switchSession = (id: string) => chatStore.switchSession(id)
const newChat = () => chatStore.initSession()
const toggleHistory = () => showHistory.value = !showHistory.value

const send = async () => {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  const sessionId = chatStore.currentSessionId || chatStore.initSession()
  chatStore.messagesMap[sessionId] = [...(chatStore.messagesMap[sessionId] || []), {
    id: crypto.randomUUID(), role: 'user', content: text, timestamp: Date.now()
  }]
  inputText.value = ''

  chatStore.isLoading = true
  try {
    const res = await fetch('/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Id': localStorage.getItem('userId') || 'default-user' },
      body: JSON.stringify({ sessionId, message: text })
    })
    const data = await res.json()
    chatStore.messagesMap[sessionId] = [...(chatStore.messagesMap[sessionId] || []), {
      id: crypto.randomUUID(), role: 'assistant', content: data.text, timestamp: Date.now()
    }]

    if ((chatStore.messagesMap[sessionId]?.length || 0) <= 2) {
      const autoName = text.length > 20 ? text.slice(0, 20) + '…' : text
      await chatStore.updateSessionName(sessionId, autoName)
    }
  } catch (e) {
    console.error(e)
    chatStore.messagesMap[sessionId] = [...(chatStore.messagesMap[sessionId] || []), {
      id: crypto.randomUUID(), role: 'assistant', content: '抱歉，请求失败。', timestamp: Date.now()
    }]
  } finally {
    chatStore.isLoading = false
  }
}

// 涟漪 WebSocket 保持不变
const { rippleEvents, connect, disconnect } = useWebSocket()
watch(currentSessionId, id => { disconnect(); if (id) connect(id) }, { immediate: true })
</script>
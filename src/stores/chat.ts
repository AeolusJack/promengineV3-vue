import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message } from '@/types'
import { chatApi } from '@/api/chat'
import { v4 as uuidv4 } from 'uuid'

export const useChatStore = defineStore('chat', () => {
  const sessions = ref<{ id: string; name: string }[]>([])
  const currentSessionId = ref<string>('')
  const messagesMap = ref<Record<string, Message[]>>({})
  const isLoading = ref(false)

  // 当前会话的消息
  const currentMessages = computed(() => {
    if (!currentSessionId.value) return []
    return messagesMap.value[currentSessionId.value] || []
  })

  // 从后端加载会话列表
  const fetchSessions = async () => {
    try {
      const res = await chatApi.getSessions()
      sessions.value = res.data.map((s: any) => ({
        id: s.id,
        name: s.name || '新会话',
      }))
      if (!currentSessionId.value && sessions.value.length > 0) {
        await switchSession(sessions.value[0].id)
      }
    } catch (error) {
      console.error('获取会话列表失败', error)
    }
  }

  // 更新会话名称（持久化到后端）
  const updateSessionName = async (sessionId: string, newName: string) => {
    await chatApi.updateSessionName(sessionId, newName)
    const session = sessions.value.find(s => s.id === sessionId)
    if (session) session.name = newName
  }

  // 加载指定会话的历史消息
  const fetchMessages = async (sessionId: string) => {
    if (!sessionId) return
    try {
      const res = await chatApi.getSessionMessages(sessionId)
      messagesMap.value[sessionId] = res.data || []
    } catch (error) {
      console.error('获取会话消息失败', error)
      messagesMap.value[sessionId] = []
    }
  }

  // 切换到指定会话
  const switchSession = async (id: string) => {
    if (id === currentSessionId.value) return
    currentSessionId.value = id
    if (!messagesMap.value[id]) {
      await fetchMessages(id)
    }
  }

  // 新建会话
  const initSession = () => {
    const newId = uuidv4()
    const newSession = { id: newId, name: '新会话' }
    sessions.value.unshift(newSession)
    messagesMap.value[newId] = []
    currentSessionId.value = newId
    return newId
  }

  // 发送消息
  const sendMessage = async (text: string) => {
    if (!currentSessionId.value) {
      initSession()
    }
    const sessionId = currentSessionId.value

    // 用户消息
    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    if (!messagesMap.value[sessionId]) {
      messagesMap.value[sessionId] = []
    }
    messagesMap.value[sessionId].push(userMsg)

    isLoading.value = true
    try {
      const res = await chatApi.send({
        sessionId,
        message: text,
      })

      // 助手消息
      const assistantMsg: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: res.data.text,
        timestamp: Date.now(),
      }
      messagesMap.value[sessionId].push(assistantMsg)

      // 如果是当前会话的第一条消息（仅一条用户消息和一条助手消息，即回复后消息总数为2），自动设置会话名
      if (messagesMap.value[sessionId].length === 2) {
        const autoName = text.length > 20 ? text.slice(0, 20) + '…' : text
        await updateSessionName(sessionId, autoName)
      }
    } catch (error) {
      console.error('发送消息失败', error)
      messagesMap.value[sessionId].push({
        id: uuidv4(),
        role: 'assistant',
        content: '抱歉，发送失败，请稍后重试。',
        timestamp: Date.now(),
      })
    } finally {
      isLoading.value = false
    }
  }

  // 删除会话
  const deleteSession = (id: string) => {
    sessions.value = sessions.value.filter(s => s.id !== id)
    delete messagesMap.value[id]
    if (currentSessionId.value === id) {
      currentSessionId.value = sessions.value[0]?.id || ''
    }
  }

  return {
    sessions,
    currentSessionId,
    messages: currentMessages,
    isLoading,
    messagesMap,       // 新增
    fetchSessions,
    fetchMessages,
    switchSession,
    initSession,
    sendMessage,
    deleteSession,
    updateSessionName,
  }
})
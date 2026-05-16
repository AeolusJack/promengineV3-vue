// src/composables/useWebSocket.ts
import { ref, onUnmounted } from 'vue'
import type { RippleEvent } from '@/types'

// 事件处理器类型
type EventHandler = (data: any) => void

export function useWebSocket() {
  const socket = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const rippleEvents = ref<RippleEvent[]>([])

  // 事件处理器注册表
  const handlers = new Map<string, Set<EventHandler>>()

  // ==================== 连接管理 ====================

  const connect = (sessionId: string) => {
    disconnect()
    if (!sessionId) return


    // const wsUrl = `ws://localhost:8080/ws/ripple?sessionId=${sessionId}`
     const token = localStorage.getItem('token') || ''
  const wsUrl = `ws://localhost:8080/ws/ripple?sessionId=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => { isConnected.value = true }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // 1. 分发到注册的通用处理器
        const type = data.type
        if (type && handlers.has(type)) {
          handlers.get(type)!.forEach(handler => handler(data))
        }

        // 2. 仍然自动收集涟漪事件（保持向后兼容）
        if (type === 'ripple') {
          const ripple: RippleEvent = {
            entropy: data.entropy,
            color: data.color,
            timestamp: data.timestamp || Date.now(),
          }
          rippleEvents.value.push(ripple)
          if (rippleEvents.value.length > 50) {
            rippleEvents.value.shift()
          }
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message', e)
      }
    }

    ws.onclose = () => { isConnected.value = false }
    ws.onerror = (err) => { console.error('WebSocket error', err) }

    socket.value = ws
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
    isConnected.value = false
  }

  // ==================== 事件注册 ====================

  /**
   * 注册特定事件类型的回调函数。
   * @param type 事件类型（如 'react_step', 'review_request', 'group-message'）
   * @param handler 处理函数
   */
  const on = (type: string, handler: EventHandler) => {
    if (!handlers.has(type)) {
      handlers.set(type, new Set())
    }
    handlers.get(type)!.add(handler)
  }

  /**
   * 移除事件处理器。
   * @param type 事件类型
   * @param handler 要移除的处理器（若省略，则移除该类型的所有处理器）
   */
  const off = (type: string, handler?: EventHandler) => {
    if (!handlers.has(type)) return
    if (handler) {
      handlers.get(type)!.delete(handler)
    } else {
      handlers.delete(type)
    }
  }

  // ==================== 生命周期 ====================

  onUnmounted(() => {
    disconnect()
    handlers.clear()
  })

  return {
    isConnected,
    rippleEvents,
    connect,
    disconnect,
    on,
    off,
  }
}
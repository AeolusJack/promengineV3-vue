import { ref, onUnmounted } from 'vue'
import type { RippleEvent } from '@/types'

export function useWebSocket() {
  const socket = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const rippleEvents = ref<RippleEvent[]>([])

  const connect = (sessionId: string) => {
    disconnect()

    if (!sessionId) return

    const wsUrl = `ws://localhost:8080/ws/ripple?sessionId=${sessionId}`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      isConnected.value = true
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        // 只处理思维涟漪事件
        if (data.type !== 'ripple') return

        const ripple: RippleEvent = {
          entropy: data.entropy,
          color: data.color,
          timestamp: data.timestamp || Date.now(),
        }
        rippleEvents.value.push(ripple)
        if (rippleEvents.value.length > 50) {
          rippleEvents.value.shift()
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message', e)
      }
    }

    ws.onclose = () => {
      isConnected.value = false
    }

    ws.onerror = (err) => {
      console.error('WebSocket error', err)
    }

    socket.value = ws
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
    isConnected.value = false
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    rippleEvents,
    connect,
    disconnect,
  }
}
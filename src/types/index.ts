export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  timestamp: number
  toolCalls?: ToolCall[]
  thinkingTrace?: ThinkingTrace
}

export interface ToolCall {
  name: string
  arguments: Record<string, any>
  result?: string
}

export interface ThinkingTrace {
  steps: ReActStep[]
  memoriesRetrieved: number
  rippleEvents: RippleEvent[]
}

export interface ReActStep {
  round: number
  llmResponse: string
  toolCalls: ToolCall[]
  observations: string[]
}

export interface RippleEvent {
  entropy: number
  color: 'green' | 'orange' | 'red'
  timestamp: number
}

export interface MemoryEntry {
  id: string
  userId: string
  content: string
  summary?: string
  timestamp: number
  memoryType: string
  layer: string
  domain: string
  strength: number          // 确保存在且为 number
  utilityScore: number      // 确保存在且为 number
  safetyScore: number       // 确保存在且为 number
  sharingLevel: string
  metadata?: Record<string, any>
}

export interface GroupMessage {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  agentId?: string
  agentName?: string
  avatar?: string
  timestamp: number
}

export interface GroupAgent {
  agentId: string
  name: string
  avatar?: string
  role?: string
}
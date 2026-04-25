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
  strength: number
  utilityScore: number
  safetyScore: number
  sharingLevel: string
  metadata?: Record<string, any>
}
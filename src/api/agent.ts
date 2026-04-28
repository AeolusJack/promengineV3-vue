import client from './client'
import type { GroupMessage, GroupAgent } from '@/types'

// 直接使用 types 中的 AgentConfig，不再重复定义
export type AgentConfig = {
  id: string
  name: string
  description: string
  avatar?: string
  mode: 'silicon' | 'carbon'
  isIndependent: boolean
  systemPrompt: string
  skills: string[]
  tools: string[]
  proactiveLevel: 'none' | 'query' | 'remind'
  schedule?: string
  modelPreference?: string
  memoryDomain?: string
  visibility: 'private' | 'shared'
  enabled: boolean
  createdAt: number
  createdBy: 'frontend' | 'backend'
}

export interface AgentGroup {
  id: string
  name: string
  agents: GroupAgent[]
  topic: string
  maxRounds: number
  autoMode: boolean
  status: 'active' | 'paused' | 'ended'
  createdAt: number
}

export type { GroupAgent, GroupMessage }

export const agentApi = {
  list: () => client.get<any>('/agents'),
  get: (id: string) => client.get<any>(`/agents/${id}`),
  create: (data: Partial<AgentConfig>) => client.post<any>('/agents', data),
  update: (id: string, data: Partial<AgentConfig>) => client.put<any>(`/agents/${id}`, data),
  delete: (id: string) => client.delete<any>(`/agents/${id}`),
  toggle: (id: string, enabled: boolean) => client.patch<any>(`/agents/${id}/toggle`, { enabled }),

  listGroups: () => client.get<any>('/agents/groups'),
  getGroup: (id: string) => client.get<any>(`/agents/groups/${id}`),
  createGroup: (data: Partial<AgentGroup>) => client.post<any>('/agents/groups', data),
  getGroupMessages: (groupId: string) => client.get<any>(`/agents/groups/${groupId}/messages`),
  sendGroupMessage: (groupId: string, message: string) =>
    client.post<any>(`/agents/groups/${groupId}/messages`, { message }),
  startDiscussion: (groupId: string) => client.post<any>(`/agents/groups/${groupId}/start`),
  nextRound: (groupId: string) => client.post<any>(`/agents/groups/${groupId}/next`),
  stopDiscussion: (groupId: string) => client.post<any>(`/agents/groups/${groupId}/stop`),
}
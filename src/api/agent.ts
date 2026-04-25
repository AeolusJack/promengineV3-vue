import client from './client'

export interface AgentConfig {
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

export interface GroupAgent {
  agentId: string
  name: string
  avatar?: string
  role?: string
}

export interface GroupMessage {
  id: string
  role: 'user' | 'agent' | 'system'
  agentId?: string
  agentName?: string
  avatar?: string
  content: string
  timestamp: number
}

export const agentApi = {
  // Agent CRUD
  list: () => client.get<AgentConfig[]>('/agents'),
  get: (id: string) => client.get<AgentConfig>(`/agents/${id}`),
  create: (data: Partial<AgentConfig>) => client.post<AgentConfig>('/agents', data),
  update: (id: string, data: Partial<AgentConfig>) => client.put<AgentConfig>(`/agents/${id}`, data),
  delete: (id: string) => client.delete(`/agents/${id}`),
  toggle: (id: string, enabled: boolean) => client.patch(`/agents/${id}/toggle`, { enabled }),

  // 群组
  listGroups: () => client.get<AgentGroup[]>('/agents/groups'),
  getGroup: (id: string) => client.get<AgentGroup>(`/agents/groups/${id}`),
  createGroup: (data: Partial<AgentGroup>) => client.post<AgentGroup>('/agents/groups', data),
  getGroupMessages: (groupId: string) => client.get<GroupMessage[]>(`/agents/groups/${groupId}/messages`),
  sendGroupMessage: (groupId: string, message: string) =>
    client.post<GroupMessage>(`/agents/groups/${groupId}/messages`, { message }),
  startDiscussion: (groupId: string) => client.post(`/agents/groups/${groupId}/start`),
  nextRound: (groupId: string) => client.post(`/agents/groups/${groupId}/next`),
  stopDiscussion: (groupId: string) => client.post(`/agents/groups/${groupId}/stop`),
}
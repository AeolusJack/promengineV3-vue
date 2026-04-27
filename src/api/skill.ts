import client from './client'

export interface SkillConfig {
  id: string
  name: string
  description: string
  version: string
  source: string
  enabled: boolean
  associatedAgents: string[]
  parameters?: Record<string, any>
}

export const skillApi = {
  list: () => client.get<{ success: boolean; data: SkillConfig[] }>('/skills'),
  get: (id: string) => client.get(`/skills/${id}`),
  create: (data: Partial<SkillConfig>) => client.post('/skills', data),
  update: (id: string, data: Partial<SkillConfig>) => client.put(`/skills/${id}`, data),
  delete: (id: string) => client.delete(`/skills/${id}`),
  toggle: (id: string, enabled: boolean) => client.patch(`/skills/${id}/toggle`, { enabled }),
  installFromMcp: (serverUrl: string) => client.post('/skills/install-mcp', { serverUrl }),
}
import client from './client'

export interface SkillConfig {
  id: string
  name: string
  description: string
  version: string
  source: 'builtin' | 'mcp' | 'custom'
  content?: string
  enabled: boolean
  associatedAgents: string[]
  parameters?: Record<string, any>
}

export const skillApi = {
  list: () => client.get<SkillConfig[]>('/skills'),
  get: (id: string) => client.get<SkillConfig>(`/skills/${id}`),
  create: (data: Partial<SkillConfig>) => client.post<SkillConfig>('/skills', data),
  update: (id: string, data: Partial<SkillConfig>) => client.put<SkillConfig>(`/skills/${id}`, data),
  delete: (id: string) => client.delete(`/skills/${id}`),
  toggle: (id: string, enabled: boolean) => client.patch(`/skills/${id}/toggle`, { enabled }),
  installFromMcp: (serverUrl: string) => client.post('/skills/install-mcp', { serverUrl }),
  uploadCustom: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return client.post('/skills/upload', formData)
  },
}
import client from './client'

export interface ToolInfo {
  name: string
  description: string
  category: string
  location: 'local' | 'sandbox' | 'remote'
  enabled: boolean
  parameters: ToolParameter[]
  stats?: ToolStats
}

export interface ToolParameter {
  name: string
  type: string
  description: string
  required: boolean
  example?: string
}

export interface ToolStats {
  totalCalls: number
  successRate: number
  avgLatencyMs: number
}

export const toolApi = {
  list: () => client.get<ToolInfo[]>('/tools'),
  get: (name: string) => client.get<ToolInfo>(`/tools/${name}`),
  toggle: (name: string, enabled: boolean) => client.patch(`/tools/${name}/toggle`, { enabled }),
  test: (name: string, params: Record<string, any>) =>
    client.post<{ result: string }>(`/tools/${name}/test`, params),
  getStats: (name: string) => client.get<ToolStats>(`/tools/${name}/stats`),
}
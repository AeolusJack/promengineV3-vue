import client from './client'

export interface ToolInfo {
  name: string
  description: string
  category: string
  location: string
  enabled: boolean
  parameters: ToolParameter[]
  stats?: ToolStats
}

export interface ToolParameter {
  name: string; type: string; description: string; required: boolean; example?: string
}

export interface ToolStats { totalCalls: number; successRate: number; avgLatencyMs: number }

export const toolApi = {
  list: () => client.get<{ success: boolean; data: ToolInfo[] }>('/tools'),
  toggle: (name: string, enabled: boolean) => client.patch(`/tools/${name}/toggle`, { enabled }),
  test: (name: string, params: Record<string, any>) =>
    client.post<{ success: boolean; data: { result: string } }>(`/tools/${name}/test`, params),
}
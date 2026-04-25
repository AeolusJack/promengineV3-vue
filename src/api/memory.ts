import client from './client'

export interface MemoryEntry {
  id: string
  userId: string
  content: string
  summary: string
  timestamp: number
  memoryType: string
  layer: string
  domain: string
  strength: number
  utilityScore: number
  safetyScore: number
  metadata: Record<string, any>
}

export interface RetrievalDebugResult {
  hotHits: MemoryEntry[]
  luceneHits: MemoryEntry[]
  vectorHits: MemoryEntry[]
  graphHits: MemoryEntry[]
  fusedHits: MemoryEntry[]
  tookMs: number
}



export const memoryApi = {

    remember: (content: string, metadata?: Record<string, any>) =>
    client.post('/memory/remember', { content, metadata }),
   recall: (query: string, domain?: string, maxResults?: number) =>
    client.post('/memory/recall', { text: query, domain, maxResults }),
  // ... 已有方法

  // 分层浏览
getLayers: () => client.get<{ layers: string[]; counts: Record<string, number> }>('/memory/layers'),

  getMemoriesByLayer: (layer: string, params?: { page?: number; size?: number; keyword?: string }) =>
    client.get<{ data: MemoryEntry[]; total: number }>(`/memory/layer/${layer}`, { params }),

  // 质量标注
  markQuality: (id: string, action: 'good' | 'bad') =>
    client.post(`/memory/${id}/quality`, { action }),
  batchMarkQuality: (ids: string[], action: 'good' | 'bad') =>
    client.post('/memory/quality/batch', { ids, action }),
  convertToProcedural: (id: string) => client.post(`/memory/${id}/convert-to-procedural`),

  // 检索调试
  debugRetrieval: (query: string, domain?: string, topK?: number) =>
    client.post<RetrievalDebugResult>('/memory/retrieval/debug', { query, domain, topK }),

  // 遗忘曲线
  getDecayCurve: (id: string) => client.get<{ points: { days: number; strength: number }[] }>(`/memory/${id}/decay-curve`),
}
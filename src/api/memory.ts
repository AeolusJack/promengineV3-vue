import client from './client'
import type { MemoryEntry } from '@/types'

export interface FusedHit extends MemoryEntry {
  _score?: number
  _source?: string
}

export interface RetrievalDebugResult {
  workingHits: MemoryEntry[]
  episodicHits: MemoryEntry[]
  luceneHits: MemoryEntry[]
  vectorHits: MemoryEntry[]
  graphHits: MemoryEntry[]
  fusedHits: FusedHit[]
  tookMs: number
}

// ════════════════ 解包工具函数 ════════════════
function unwrap<T>(res: any): T {
  const body = res?.data
  if (body && typeof body === 'object' && 'success' in body) {
    return body.success ? (body.data as T) : (null as any)
  }
  return body as T
}

export const memoryApi = {

  // 写入记忆
  remember: (content: string, metadata?: Record<string, any>) =>
    client.post('/memory/remember', { content, metadata }),

  // 召回记忆
  recall: (query: string, domain?: string, maxResults?: number) =>
    client.post('/memory/recall', { text: query, domain, maxResults }),

  // 获取层级列表
  getLayers: (): Promise<{ layers: string[]; counts: Record<string, number> }> =>
    client.get('/memory/layers').then(unwrap),

  // 分页关键词查询（分层浏览的核心）
  getMemoriesByLayer: (
    layer: string,
    params?: { page?: number; size?: number; keyword?: string }
  ): Promise<{ data: MemoryEntry[]; total: number }> =>
    client.get(`/memory/layer/${layer}`, { params }).then(unwrap),

  // 质量标注
  markQuality: (id: string, action: 'good' | 'bad') =>
    client.post(`/memory/${id}/quality`, { action }),

  batchMarkQuality: (ids: string[], action: 'good' | 'bad') =>
    client.post('/memory/quality/batch', { ids, action }),

  // 转化为过程记忆
  convertToProcedural: (id: string) =>
    client.post(`/memory/${id}/convert-to-procedural`),

  // 检索调试
  debugRetrieval: (query: string, domain?: string, topK?: number): Promise<RetrievalDebugResult> =>
    client.post('/memory/retrieval/debug', { query, domain, topK }).then(unwrap),

  // 遗忘曲线
  getDecayCurve: (id: string): Promise<{ points: { days: number; strength: number }[] }> =>
    client.get(`/memory/${id}/decay-curve`).then(unwrap),
}
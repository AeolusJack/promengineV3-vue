import client from './client'

export interface ChatRequest {
  sessionId: string
  message: string
}

export interface ChatResponse {
  text: string
  processingTimeMs: number
  modelUsed: string
  cost: number
}

export const chatApi = {
  send: (data: ChatRequest) => client.post<ChatResponse>('/chat', data),
  getSessions: () => client.get('/chat/sessions'),
   updateSessionName: (sessionId: string, name: string) =>
    client.put(`/chat/sessions/${sessionId}/name`, { name }),
  getSessionMessages: (sessionId: string) => client.get(`/chat/sessions/${sessionId}/messages`),
}
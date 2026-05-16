import client from './client'

export const sessionApi = {
  // 获取会话的所有步骤
  getSessionSteps: (sessionId: string) =>
    client.get(`/sessions/${sessionId}/steps`),

  // 根据执行ID获取步骤
  getStepsByExecution: (executionId: string) =>
    client.get(`/executions/${executionId}/steps`),
}
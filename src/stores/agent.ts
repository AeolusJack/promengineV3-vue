import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AgentConfig, AgentGroup, GroupMessage } from '@/api/agent'
import { agentApi } from '@/api/agent'

export const useAgentStore = defineStore('agent', () => {
  const agents = ref<AgentConfig[]>([])
  const groups = ref<AgentGroup[]>([])
  const currentGroup = ref<AgentGroup | null>(null)
  const groupMessages = ref<GroupMessage[]>([])
  const loading = ref(false)

  const extractData = (res: any) => {
    // 后端统一格式 { success, data, error }
    const body = res.data
    if (body && body.success) {
      return body.data
    }
    return body  // 兼容其他格式
  }

  const fetchAgents = async () => {
    const res = await agentApi.list()
    agents.value = extractData(res) || []
  }

  const toggleAgent = async (id: string, enabled: boolean) => {
    await agentApi.toggle(id, enabled)
    const agent = agents.value.find(a => a.id === id)
    if (agent) agent.enabled = enabled
  }

  const createAgent = async (data: Partial<AgentConfig>) => {
    const res = await agentApi.create(data)
    const agent = extractData(res)
    if (agent) agents.value.push(agent)
    return agent
  }

  const updateAgent = async (id: string, data: Partial<AgentConfig>) => {
    const res = await agentApi.update(id, data)
    const updated = extractData(res)
    if (updated) {
      const idx = agents.value.findIndex(a => a.id === id)
      if (idx >= 0) agents.value[idx] = updated
    }
    return updated
  }

  const deleteAgent = async (id: string) => {
    await agentApi.delete(id)
    agents.value = agents.value.filter(a => a.id !== id)
  }

  const fetchGroups = async () => {
    const res = await agentApi.listGroups()
    groups.value = extractData(res) || []
  }

  const createGroup = async (data: Partial<AgentGroup>) => {
    const res = await agentApi.createGroup(data)
    const group = extractData(res)
    if (group) groups.value.push(group)
    return group
  }

  const fetchGroupMessages = async (groupId: string) => {
    const res = await agentApi.getGroupMessages(groupId)
    groupMessages.value = extractData(res) || []
  }

  const sendGroupMessage = async (groupId: string, message: string) => {
    const res = await agentApi.sendGroupMessage(groupId, message)
    const msg = extractData(res)
    if (msg) groupMessages.value.push(msg)
    return msg
  }

  const startDiscussion = async (groupId: string) => {
    await agentApi.startDiscussion(groupId)
  }

  const nextRound = async (groupId: string) => {
    await agentApi.nextRound(groupId)
    await fetchGroupMessages(groupId)
  }

  const stopDiscussion = async (groupId: string) => {
    await agentApi.stopDiscussion(groupId)
  }
  

  // 新增：直接添加一条群组消息（用于 WebSocket 推送）
  const addGroupMessage = (msg: GroupMessage) => {
    groupMessages.value.push(msg)
  }

  return {
    agents,
    groups,
    currentGroup,
    groupMessages,
    loading,
    addGroupMessage,
    fetchAgents,
    toggleAgent,
    createAgent,
    updateAgent,
    deleteAgent,
    fetchGroups,
    createGroup,
    fetchGroupMessages,
    sendGroupMessage,
    startDiscussion,
    nextRound,
    stopDiscussion,
  }
})
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AgentConfig, AgentGroup, GroupMessage } from '@/types'
import { agentApi } from '@/api/agent'

export const useAgentStore = defineStore('agent', () => {
  const agents = ref<AgentConfig[]>([])
  const groups = ref<AgentGroup[]>([])
  const currentGroup = ref<AgentGroup | null>(null)
  const groupMessages = ref<GroupMessage[]>([])
  const loading = ref(false)

  const fetchAgents = async () => {
    const res = await agentApi.list()
    agents.value = res.data
  }

  const toggleAgent = async (id: string, enabled: boolean) => {
    await agentApi.toggle(id, enabled)
    const agent = agents.value.find(a => a.id === id)
    if (agent) agent.enabled = enabled
  }

  const createAgent = async (data: Partial<AgentConfig>) => {
    const res = await agentApi.create(data)
    agents.value.push(res.data)
    return res.data
  }

  const updateAgent = async (id: string, data: Partial<AgentConfig>) => {
    const res = await agentApi.update(id, data)
    const idx = agents.value.findIndex(a => a.id === id)
    if (idx >= 0) agents.value[idx] = res.data
    return res.data
  }

  const deleteAgent = async (id: string) => {
    await agentApi.delete(id)
    agents.value = agents.value.filter(a => a.id !== id)
  }

  const fetchGroups = async () => {
    const res = await agentApi.listGroups()
    groups.value = res.data
  }

  const createGroup = async (data: Partial<AgentGroup>) => {
    const res = await agentApi.createGroup(data)
    groups.value.push(res.data)
    return res.data
  }

  const fetchGroupMessages = async (groupId: string) => {
    const res = await agentApi.getGroupMessages(groupId)
    groupMessages.value = res.data
  }

  const sendGroupMessage = async (groupId: string, message: string) => {
    const res = await agentApi.sendGroupMessage(groupId, message)
    groupMessages.value.push(res.data)
    return res.data
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

  return {
    agents,
    groups,
    currentGroup,
    groupMessages,
    loading,
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
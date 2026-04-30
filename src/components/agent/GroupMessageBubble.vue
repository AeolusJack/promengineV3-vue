<template>
  <div :class="['flex', message.role === 'user' ? 'justify-end' : 'justify-start']">
    <div class="flex items-start max-w-[80%]">
      <!-- Agent 头像（主持人发言不显示） -->
      <img
        v-if="message.role === 'agent'"
        :src="agentAvatar"
        class="w-6 h-6 rounded-full mr-2 mt-0.5 flex-shrink-0"
      />
      <div
        :class="[
          'px-3 py-2 rounded-card text-sm',
          message.role === 'user'
            ? 'bg-blue-50'
            : message.role === 'system'
            ? 'bg-gray-100 text-text-secondary italic'
            : 'bg-white border border-border-light',
        ]"
      >
        <!-- Agent 名称与角色（仅 agent 发言显示） -->
        <div v-if="message.role === 'agent'" class="flex items-center text-xs text-text-secondary mb-0.5">
          <span class="font-medium text-text-primary">{{ displayName }}</span>
          <span v-if="agentRole" class="ml-1.5 px-1.5 py-0.5 rounded-tag bg-gray-100 text-text-secondary">
            {{ agentRole }}
          </span>
        </div>
        <!-- 消息正文（Agent 使用 Markdown 渲染，其余纯文本） -->
        <div
          v-if="message.role === 'agent'"
          class="prose prose-sm max-w-none"
          v-html="safeContent"
        ></div>
        <div v-else class="whitespace-pre-wrap break-words">{{ message.content }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GroupMessage, GroupAgent } from '@/types'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps<{
  message: GroupMessage
  agents: GroupAgent[]
}>()

// 查找当前消息对应的群组成员信息
const matchedAgent = computed(() => {
  if (!props.message.agentId) return undefined
  return props.agents.find(a => a.agentId === props.message.agentId)
})

// 头像：优先使用消息自带 avatar，其次从成员信息获取，最后用 DiceBear 生成
const agentAvatar = computed(() => {
  if (props.message.avatar) return props.message.avatar
  if (matchedAgent.value?.avatar) return matchedAgent.value.avatar
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${props.message.agentId || 'unknown'}`
})

// 显示名称：优先使用消息自带 agentName，其次成员 name，最后用 agentId
const displayName = computed(() => {
  if (props.message.agentName) return props.message.agentName
  if (matchedAgent.value?.name) return matchedAgent.value.name
  return props.message.agentId || '未知发言人'
})

// 角色：优先从成员信息获取
const agentRole = computed(() => {
  return matchedAgent.value?.role || undefined
})

// Markdown 渲染
const safeContent = computed(() => renderMarkdown(props.message.content))
</script>
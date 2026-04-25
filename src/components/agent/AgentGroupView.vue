<template>
  <div class="flex h-full">
    <div class="w-56 border-r border-border-light pr-4 overflow-y-auto">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-text-secondary uppercase tracking-wider">群组</span>
        <button @click="showCreateGroup = true" class="text-primary text-xl leading-4">+</button>
      </div>
      <div class="space-y-1">
        <button
          v-for="group in groups"
          :key="group.id"
          @click="selectGroup(group)"
          :class="[
            'w-full text-left px-3 py-2 rounded-button text-sm',
            currentGroup?.id === group.id
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-text-secondary hover:bg-hover-bg',
          ]"
        >
          {{ group.name }}
          <StatusBadge :status="group.status" class="float-right mt-0.5" />
        </button>
      </div>
    </div>

    <div class="flex-1 pl-4 flex flex-col min-w-0">
      <div v-if="!currentGroup" class="flex-1 flex items-center justify-center text-text-secondary">
        选择或创建一个群组开始讨论
      </div>
      <template v-else>
        <div class="flex items-center justify-between pb-3 border-b border-border-light">
          <div>
            <h3 class="font-medium">{{ currentGroup.name }}</h3>
            <p class="text-xs text-text-secondary mt-0.5">话题：{{ currentGroup.topic }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              v-if="currentGroup.status === 'active'"
              @click="stopDiscussion"
              class="btn-secondary text-sm px-3 py-1"
            >
              停止
            </button>
            <button
              v-else-if="currentGroup.status === 'paused'"
              @click="startDiscussion"
              class="btn-primary text-sm px-3 py-1"
            >
              开始讨论
            </button>
            <button
              v-if="currentGroup.status === 'active' && !currentGroup.autoMode"
              @click="nextRound"
              class="btn-secondary text-sm px-3 py-1"
            >
              下一轮
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto py-3 space-y-3" ref="messageContainer">
          <GroupMessageBubble
            v-for="msg in messages"
            :key="msg.id"
            :message="msg"
            :agents="currentGroup.agents"
          />
        </div>

        <div class="pt-3 border-t border-border-light">
          <div class="flex items-end space-x-2">
            <textarea
              v-model="inputMessage"
              @keydown.enter.prevent="sendMessage"
              placeholder="以主持人身份发言..."
              rows="1"
              class="flex-1 resize-none max-h-32 min-h-[40px] p-2 border border-border-light rounded-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              @click="sendMessage"
              :disabled="!inputMessage.trim()"
              class="btn-primary px-4 py-2 text-sm disabled:opacity-50"
            >
              发送
            </button>
          </div>
        </div>
      </template>
    </div>

    <div v-if="currentGroup" class="w-56 pl-4 overflow-y-auto">
      <div class="text-xs text-text-secondary uppercase tracking-wider mb-2">成员</div>
      <div class="space-y-2">
        <div v-for="agent in currentGroup.agents" :key="agent.agentId" class="flex items-center">
          <AgentAvatar :agent="{ ...agent, avatar: agent.avatar } as any" size="sm" class="mr-2" />
          <div>
            <div class="text-sm">{{ agent.name }}</div>
            <div class="text-xs text-text-secondary">{{ agent.role || '成员' }}</div>
          </div>
        </div>
      </div>
      <div class="text-xs text-text-secondary uppercase tracking-wider mt-4 mb-2">信息</div>
      <div class="text-sm space-y-1">
        <div>话题：{{ currentGroup.topic }}</div>
        <div>模式：{{ currentGroup.autoMode ? '自动' : '手动' }}</div>
        <div>最大轮数：{{ currentGroup.maxRounds }}</div>
      </div>
      <button
        @click="saveToMemory"
        class="btn-secondary w-full mt-4 text-sm py-1.5"
      >
        存入记忆
      </button>
    </div>

    <Modal v-if="showCreateGroup" @close="showCreateGroup = false" title="新建群组">
      <CreateGroupForm @submit="handleCreateGroup" @cancel="showCreateGroup = false" />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useAgentStore } from '@/stores/agent'
import StatusBadge from './StatusBadge.vue'
import AgentAvatar from './AgentAvatar.vue'
import GroupMessageBubble from './GroupMessageBubble.vue'
import Modal from '@/components/ui/Modal.vue'
import CreateGroupForm from './CreateGroupForm.vue'
import type { AgentGroup } from '@/types'

const store = useAgentStore()
const { groups, currentGroup, groupMessages } = store

const showCreateGroup = ref(false)
const inputMessage = ref('')
const messageContainer = ref<HTMLElement>()

const messages = computed(() => groupMessages.value)

const selectGroup = async (group: AgentGroup) => {
  store.currentGroup = group
  await store.fetchGroupMessages(group.id)
  scrollToBottom()
}

const startDiscussion = () => {
  if (currentGroup.value) {
    store.startDiscussion(currentGroup.value.id)
  }
}

const stopDiscussion = () => {
  if (currentGroup.value) {
    store.stopDiscussion(currentGroup.value.id)
  }
}

const nextRound = () => {
  if (currentGroup.value) {
    store.nextRound(currentGroup.value.id)
    scrollToBottom()
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || !currentGroup.value) return
  await store.sendGroupMessage(currentGroup.value.id, inputMessage.value.trim())
  inputMessage.value = ''
  scrollToBottom()
}

const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

const saveToMemory = () => {
  // 调用记忆API
  console.log('Save group discussion to memory')
}

const handleCreateGroup = async (data: any) => {
  await store.createGroup(data)
  showCreateGroup.value = false
  await store.fetchGroups()
}

onMounted(() => {
  store.fetchGroups()
})

watch(
  () => groupMessages.value.length,
  () => scrollToBottom()
)
</script>
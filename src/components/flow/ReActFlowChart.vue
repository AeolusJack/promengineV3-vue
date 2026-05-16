<template>
  <div class="react-flow-chart p-3">
    <h4 class="text-sm font-medium mb-3 flex items-center justify-between">
      <span>{{ $t('thinking.process') }}</span>
      <span v-if="executionId" class="text-xs text-text-secondary font-normal">{{ executionId.slice(0, 8) }}</span>
    </h4>
    <div v-if="steps.length === 0" class="text-xs text-text-secondary">
      {{ $t('chat.waitingForExecution') }}
    </div>
    <div class="space-y-2">
      <div
        v-for="(step, idx) in steps"
        :key="idx"
        class="flex items-start space-x-3"
      >
        <!-- 状态指示器 -->
        <div class="flex-shrink-0 pt-0.5">
          <div :class="statusDotClass(step.status)" class="w-3 h-3 rounded-full"></div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-mono text-text-secondary">{{ step.stepNumber || (idx + 1) }}.</span>
            <span class="text-xs font-medium truncate">{{ step.title || step.description }}</span>
            <span v-if="step.status === 'RUNNING'" class="text-xs text-blue-500 animate-pulse">
              {{ $t('chat.running') }}
            </span>
            <span v-if="step.status === 'FAILED'" class="text-xs text-red-500">
              {{ $t('chat.failed') }}
            </span>
          </div>
          <div
            v-if="step.detail"
            class="text-xs text-text-secondary mt-0.5 truncate max-w-md"
            :title="step.detail"
          >
            {{ step.detail }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { sessionApi } from '@/api/session'

interface StepEvent {
  executionId?: string
  type: string
  stepNumber?: number
  description?: string
  title?: string
  detail?: string
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'COMPLETE'
  timestamp: number
}

const props = defineProps<{
  executionId?: string | null
}>()

const steps = ref<StepEvent[]>([])

// 加载远程步骤
const loadRemoteSteps = async (executionId: string) => {
  try {
    const res = await sessionApi.getStepsByExecution(executionId)
    const list = res.data?.data || res.data || []
    steps.value = list.map((item: any) => ({
      ...item,
      stepNumber: item.stepNumber ?? item.step_number,
      description: item.description || item.type,
      title: item.title || item.description,
    }))
  } catch (e) {
    console.error('加载执行步骤失败', e)
  }
}

// 监听 executionId 变化，重新加载
watch(() => props.executionId, (newId) => {
  steps.value = []
  if (newId) {
    loadRemoteSteps(newId)
  }
}, { immediate: true })

// 外部实时添加步骤
const addStep = (event: StepEvent) => {
  if (!event) return
  // 去重
  const exists = steps.value.some(
    s => s.type === event.type &&
         s.stepNumber === event.stepNumber &&
         s.timestamp === event.timestamp
  )
  if (!exists) {
    steps.value.push({
      ...event,
      stepNumber: event.stepNumber || (steps.value.length + 1),
      title: event.title || event.description,
    })
    if (steps.value.length > 50) steps.value.shift()
  }
}

const clear = () => {
  steps.value = []
}

const statusDotClass = (status: string) => {
  switch (status) {
    case 'RUNNING': return 'bg-blue-500'
    case 'SUCCESS': return 'bg-green-500'
    case 'FAILED': return 'bg-red-500'
    case 'COMPLETE': return 'bg-green-500'
    default: return 'bg-gray-400'
  }
}

defineExpose({ addStep, clear, steps })
</script>
<template>
  <Drawer :visible="true" @close="emit('close')" :title="`测试 ${tool.name}`">
    <div class="space-y-4">
      <p class="text-sm text-text-secondary">{{ tool.description }}</p>
      <div v-for="param in tool.parameters" :key="param.name" class="space-y-1">
        <label class="block text-sm font-medium">
          {{ param.name }}
          <span class="text-text-secondary text-xs ml-1">({{ param.type }})</span>
          <span v-if="param.required" class="text-red-500 ml-1">*</span>
        </label>
        <input
          v-if="param.type === 'string'"
          v-model="formValues[param.name]"
          type="text"
          :placeholder="param.example || param.description"
          class="w-full input"
        />
        <input
          v-else-if="param.type === 'number' || param.type === 'integer'"
          v-model.number="formValues[param.name]"
          type="number"
          :placeholder="param.example"
          class="w-full input"
        />
        <select
          v-else-if="param.type === 'boolean'"
          v-model="formValues[param.name]"
          class="w-full input"
        >
          <option :value="true">true</option>
          <option :value="false">false</option>
        </select>
        <textarea
          v-else-if="param.type === 'object' || param.type === 'array'"
          v-model="formValues[param.name]"
          rows="4"
          placeholder='{"key": "value"}'
          class="w-full input font-mono text-sm"
        />
      </div>
      <div class="flex justify-end space-x-3 pt-4 border-t border-border-light">
        <button @click="emit('close')" class="btn-secondary">取消</button>
        <button @click="handleExecute" :disabled="executing" class="btn-primary">
          {{ executing ? '执行中...' : '执行' }}
        </button>
      </div>
      <div v-if="result !== null" class="mt-4">
        <label class="block text-sm font-medium mb-2">执行结果</label>
        <pre class="bg-bg-secondary p-3 rounded-card text-sm overflow-auto max-h-64">{{ result }}</pre>
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import Drawer from '@/components/ui/Drawer.vue'
import { toolApi } from '@/api/tools'
import type { ToolInfo } from '@/api/tools'

const props = defineProps<{ tool: ToolInfo }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'execute', toolName: string, params: Record<string, any>): Promise<string>  // 可保留，不再使用
}>()

const executing = ref(false)
const result = ref<string | null>(null)

// 初始化表单值
const formValues = reactive<Record<string, any>>({})
props.tool.parameters.forEach(p => {
  if (p.type === 'boolean') {
    formValues[p.name] = false
  } else if (p.type === 'number' || p.type === 'integer') {
    formValues[p.name] = 0
  } else if (p.type === 'object' || p.type === 'array') {
    formValues[p.name] = '{}'
  } else {
    formValues[p.name] = ''
  }
})

const handleExecute = async () => {
  executing.value = true
  result.value = null
  try {
    // 组装参数对象
    const params: Record<string, any> = {}
    for (const p of props.tool.parameters) {
      let value = formValues[p.name]
      if (p.type === 'object' || p.type === 'array') {
        try {
          value = JSON.parse(value)
        } catch (e) {
          // 保持原始字符串
        }
      }
      params[p.name] = value
    }
    const res = await toolApi.test(props.tool.name, params)
    // 提取结果：根据后端 ApiResponse 格式，结果在 data.data.result
    const responseData = res.data
    if (responseData && responseData.success) {
      result.value = responseData.data?.result ?? '执行完成（无返回结果）'
    } else {
      result.value = responseData?.error || '请求失败'
    }
  } catch (e: any) {
    console.error('工具执行失败', e)
    result.value = '执行失败：' + (e.message || e)
  } finally {
    executing.value = false
  }
}
</script>
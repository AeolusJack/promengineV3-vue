<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-medium">工具工坊</h2>
      <div class="flex items-center space-x-2">
        <button @click="refreshTools" class="btn-secondary text-sm px-3 py-1.5">
          刷新
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ToolCard
          v-for="tool in tools"
          :key="tool.id"
          :tool="tool"
          @toggle="handleToggle"
          @test="openTestDrawer"
          @view="openDetailDrawer"
        />
      </div>
    </div>

    <ToolTestDrawer
      v-if="testingTool"
      :tool="testingTool"
      @close="testingTool = null"
      @execute="handleTestExecute"
    />

    <ToolDetailDrawer
      v-if="detailTool"
      :tool="detailTool"
      @close="detailTool = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ToolCard from '@/components/tools/ToolCard.vue'
import ToolTestDrawer from '@/components/tools/ToolTestDrawer.vue'
import ToolDetailDrawer from '@/components/tools/ToolDetailDrawer.vue'
import { toolApi } from '@/api/tools'
import type { ToolInfo } from '@/types'
import { onBeforeRouteLeave } from 'vue-router'

const tools = ref<ToolInfo[]>([])
const testingTool = ref<ToolInfo | null>(null)
const detailTool = ref<ToolInfo | null>(null)

const fetchTools = async () => {
  const res = await toolApi.list()
  tools.value = res.data
}

const refreshTools = () => {
  fetchTools()
}

const handleToggle = async (tool: ToolInfo, enabled: boolean) => {
  await toolApi.toggle(tool.name, enabled)
  const t = tools.value.find(t => t.name === tool.name)
  if (t) t.enabled = enabled
}

const openTestDrawer = (tool: ToolInfo) => {
  testingTool.value = tool
}

const openDetailDrawer = (tool: ToolInfo) => {
  detailTool.value = tool
}

const handleTestExecute = async (toolName: string, params: Record<string, any>) => {
  const res = await toolApi.test(toolName, params)
  return res.data.result
}

onMounted(() => {
  fetchTools()
})


const showCreateDrawer = ref(false)
const editingAgent = ref(null)
onBeforeRouteLeave((to, from, next) => {
  showCreateDrawer.value = false
  editingAgent.value = null
  next()
})
</script>
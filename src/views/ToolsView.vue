<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-medium">工具工坊</h2>
      <button @click="refresh" class="btn-secondary text-sm px-3 py-1.5">刷新</button>
    </div>
    <div class="flex-1 overflow-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ToolCard v-for="tool in tools" :key="tool.name" :tool="tool"
                  @toggle="handleToggle" @test="openTestDrawer" @view="openDetailDrawer" />
      </div>
    </div>
    <ToolTestDrawer v-if="testingTool" :tool="testingTool" @close="testingTool = null"
                    @execute="handleTestExecute" />
    <ToolDetailDrawer v-if="detailTool" :tool="detailTool" @close="detailTool = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ToolCard from '@/components/tools/ToolCard.vue'
import ToolTestDrawer from '@/components/tools/ToolTestDrawer.vue'
import ToolDetailDrawer from '@/components/tools/ToolDetailDrawer.vue'
import { toolApi, type ToolInfo } from '@/api/tools'

const tools = ref<ToolInfo[]>([])
const testingTool = ref<ToolInfo | null>(null)
const detailTool = ref<ToolInfo | null>(null)

const fetchTools = async () => {
  const res = await toolApi.list()
  tools.value = res.data.data || []
}
const refresh = () => fetchTools()
const handleToggle = async (tool: ToolInfo, enabled: boolean) => {
  await toolApi.toggle(tool.name, enabled)
  const t = tools.value.find(t => t.name === tool.name)
  if (t) t.enabled = enabled
}
const openTestDrawer = (t: ToolInfo) => { testingTool.value = t }
const openDetailDrawer = (t: ToolInfo) => { detailTool.value = t }
const handleTestExecute = async (name: string, params: Record<string, any>) => {
  const res = await toolApi.test(name, params)
  return res.data.data?.result ?? '执行完成'
}

onMounted(fetchTools)
</script>
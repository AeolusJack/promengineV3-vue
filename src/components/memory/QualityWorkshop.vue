<template>
  <div class="h-full overflow-auto space-y-6">
    <!-- 待审核记忆 -->
    <div class="card p-5">
      <h3 class="font-medium mb-4 flex items-center">
        <AlertCircle class="w-5 h-5 mr-2 text-orange-500" />
        待审核记忆
        <span class="ml-2 text-sm text-text-secondary">(安全评分 &lt; 0.3)</span>
      </h3>
      <div v-if="pendingMemories.length === 0" class="text-text-secondary text-sm py-4 text-center">
        暂无待审核记忆
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-border-light">
            <th class="w-8 py-2 text-left">
              <input type="checkbox" v-model="pendingSelectAll" @change="togglePendingSelectAll" class="rounded" />
            </th>
            <th class="py-2 text-left font-medium text-text-secondary">内容摘要</th>
            <th class="py-2 text-left font-medium text-text-secondary w-24">安全评分</th>
            <th class="py-2 text-left font-medium text-text-secondary w-32">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mem in pendingMemories" :key="mem.id" class="border-b border-border-light">
            <td class="py-2">
              <input type="checkbox" v-model="pendingSelected" :value="mem.id" class="rounded" />
            </td>
            <td class="py-2 truncate max-w-md">{{ mem.summary || mem.content }}</td>
            <td class="py-2">
              <span :class="mem.safetyScore < 0.2 ? 'text-red-500' : 'text-orange-500'">
                {{ mem.safetyScore?.toFixed(2) }}
              </span>
            </td>
            <td class="py-2">
              <div class="flex items-center space-x-2">
                <button @click="markGood(mem.id)" class="text-green-600 text-xs hover:underline">优质</button>
                <button @click="markBad(mem.id)" class="text-red-500 text-xs hover:underline">废弃</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="pendingSelected.length" class="mt-3 flex items-center space-x-3">
        <span class="text-sm text-text-secondary">已选 {{ pendingSelected.length }} 条</span>
        <button @click="batchMarkGood" class="text-green-600 text-sm hover:underline">批量优质</button>
        <button @click="batchMarkBad" class="text-red-500 text-sm hover:underline">批量废弃</button>
      </div>
    </div>

    <!-- 高分记忆 -->
    <div class="card p-5">
      <h3 class="font-medium mb-4 flex items-center">
        <Star class="w-5 h-5 mr-2 text-yellow-500 fill-yellow-500" />
        高分记忆
        <span class="ml-2 text-sm text-text-secondary">(效用评分 &gt; 0.8)</span>
      </h3>
      <div v-if="highScoreMemories.length === 0" class="text-text-secondary text-sm py-4 text-center">
        暂无高分记忆
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-border-light">
            <th class="py-2 text-left font-medium text-text-secondary">内容摘要</th>
            <th class="py-2 text-left font-medium text-text-secondary w-24">效用评分</th>
            <th class="py-2 text-left font-medium text-text-secondary w-32">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mem in highScoreMemories" :key="mem.id" class="border-b border-border-light">
            <td class="py-2 truncate max-w-md">{{ mem.summary || mem.content }}</td>
            <td class="py-2 text-green-600">{{ mem.utilityScore?.toFixed(2) }}</td>
            <td class="py-2">
              <button @click="convert(mem.id)" class="text-primary text-xs hover:underline">
                转化为过程记忆
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 遗忘曲线模拟 -->
    <div class="card p-5">
      <h3 class="font-medium mb-4 flex items-center">
        <TrendingDown class="w-5 h-5 mr-2 text-text-secondary" />
        遗忘曲线模拟
      </h3>
      <div class="flex items-center space-x-4">
        <select
          v-model="selectedMemoryId"
          class="border border-border-light rounded-button px-3 py-2 text-sm w-64"
        >
          <option value="">选择一条记忆</option>
          <option v-for="mem in sampleMemories" :key="mem.id" :value="mem.id">
            {{ (mem.summary || mem.content).slice(0, 40) }}…
          </option>
        </select>
        <button
          @click="loadDecayCurve"
          :disabled="!selectedMemoryId"
          class="btn-secondary text-sm"
        >
          查看曲线
        </button>
      </div>
      <div v-if="decayData" class="mt-4 h-48" ref="chartRef"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { AlertCircle, Star, TrendingDown } from 'lucide-vue-next'
import * as echarts from 'echarts'
import { useMemoryStore } from '@/stores/memory'
import { memoryApi } from '@/api/memory'

const store = useMemoryStore()
const { memories } = storeToRefs(store)   // ✅ 保持响应性

const pendingSelected = ref<string[]>([])
const pendingSelectAll = ref(false)
const selectedMemoryId = ref('')
const decayData = ref<{ days: number; strength: number }[] | null>(null)
const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const pendingMemories = computed(() => {
  return (memories.value || []).filter(m => m.safetyScore < 0.3)
})

const highScoreMemories = computed(() => {
  return (memories.value || []).filter(m => m.utilityScore > 0.8)
})

const sampleMemories = computed(() => {
  return (memories.value || []).slice(0, 20)
})

const togglePendingSelectAll = () => {
  if (pendingSelectAll.value) {
    pendingSelected.value = pendingMemories.value.map(m => m.id)
  } else {
    pendingSelected.value = []
  }
}

const markGood = (id: string) => store.markQuality(id, 'good')
const markBad = (id: string) => store.markQuality(id, 'bad')
const convert = (id: string) => store.convertToProcedural(id)

const batchMarkGood = () => {
  store.batchMarkQuality(pendingSelected.value, 'good')
  pendingSelected.value = []
}

const batchMarkBad = () => {
  store.batchMarkQuality(pendingSelected.value, 'bad')
  pendingSelected.value = []
}

const loadDecayCurve = async () => {
  if (!selectedMemoryId.value) return
  const res = await memoryApi.getDecayCurve(selectedMemoryId.value)
  decayData.value = res.data.points
  renderChart()
}

const renderChart = () => {
  if (!chartRef.value || !decayData.value) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  const days = decayData.value.map(d => d.days)
  const strengths = decayData.value.map(d => d.strength)
  chartInstance.setOption({
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: days, name: '天数' },
    yAxis: { type: 'value', min: 0, max: 1, name: '强度' },
    series: [{
      data: strengths,
      type: 'line',
      smooth: true,
      lineStyle: { color: '#2563EB', width: 2 },
      areaStyle: { color: 'rgba(37, 99, 235, 0.1)' },
    }],
    tooltip: { trigger: 'axis' },
  })
}

onMounted(() => {
  store.fetchMemories()
})

watch(decayData, () => {
  renderChart()
})
</script>
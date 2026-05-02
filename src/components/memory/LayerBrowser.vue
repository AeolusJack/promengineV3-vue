<template>
  <div class="flex h-full">
    <!-- 左侧层级树 -->
    <div class="w-56 border-r border-border-light pr-4 overflow-y-auto">
      <div class="text-xs text-text-secondary uppercase tracking-wider mb-2">记忆层级</div>
      <div v-if="layers.length === 0" class="text-text-secondary text-sm py-2">暂无层级数据</div>
      <button
        v-for="layer in layers"
        :key="layer"
        @click="selectLayer(layer)"
        :class="[
          'w-full text-left px-3 py-2 rounded-button mb-1 text-sm',
          currentLayer === layer
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-text-secondary hover:bg-hover-bg',
        ]"
      >
        {{ layerNames[layer] || layer }}
        <span class="float-right text-xs text-text-secondary">{{ layerCounts[layer] || 0 }}</span>
      </button>
    </div>

    <!-- 右侧记忆列表 -->
    <div class="flex-1 pl-4 overflow-hidden flex flex-col">
      <div class="flex items-center justify-between mb-3">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            v-model="keyword"
            @keyup.enter="search"
            placeholder="搜索记忆..."
            class="pl-9 pr-4 py-2 border border-border-light rounded-button w-64 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div class="text-sm text-text-secondary">共 {{ total }} 条记忆</div>
      </div>

      <div class="flex-1 overflow-auto">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-bg-secondary">
            <tr class="border-b border-border-light">
              <th class="w-8 py-2 text-left">
                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="rounded" />
              </th>
              <th class="py-2 text-left font-medium text-text-secondary">摘要</th>
              <th class="py-2 text-left font-medium text-text-secondary w-28">时间</th>
              <th class="py-2 text-left font-medium text-text-secondary w-24">强度</th>
              <th class="py-2 text-left font-medium text-text-secondary w-16">效用</th>
              <th class="py-2 text-left font-medium text-text-secondary w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="mem in memories"
              :key="mem.id"
              class="border-b border-border-light hover:bg-hover-bg cursor-pointer"
              @click="openDetail(mem)"
            >
              <td class="py-2" @click.stop>
                <input type="checkbox" v-model="selectedIds" :value="mem.id" class="rounded" />
              </td>
              <td class="py-2 pr-2 max-w-md truncate" :title="mem.summary || mem.content">
                {{ mem.summary || mem.content }}
              </td>
              <td class="py-2 text-text-secondary">{{ formatTime(mem.timestamp) }}</td>
              <td class="py-2">
              <div class="flex items-center">
                <div class="w-16 h-1.5 bg-gray-200 rounded-full mr-2">
                  <div
                    class="h-full rounded-full"
                    :class="strengthColor(mem.strength ?? 0)"
                    :style="{ width: `${(mem.strength ?? 0) * 100}%` }"
                  ></div>
                </div>
                <span class="text-xs text-text-secondary">
                  {{ ((mem.strength ?? 0) * 100).toFixed(0) }}%
                </span>
              </div>
            </td>
              <td class="py-2">
                <div class="flex items-center">
                  <Star
                    :class="[
                      'w-4 h-4',
                      (mem.utilityScore ?? 0) >= 0.7
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-text-secondary',
                    ]"
                  />
                  <span class="ml-1 text-xs">{{ (mem.utilityScore ?? 0).toFixed(1) }}</span>
                </div>
              </td>
              <td class="py-2" @click.stop>
                <div class="flex items-center space-x-1">
                  <button
                    @click="markGood(mem.id)"
                    class="p-1 rounded hover:bg-green-50 text-green-600"
                    title="标记优质"
                  >
                    <ThumbsUp class="w-4 h-4" />
                  </button>
                  <button
                    @click="markBad(mem.id)"
                    class="p-1 rounded hover:bg-red-50 text-red-500"
                    title="标记废弃"
                  >
                    <ThumbsDown class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="memories.length === 0" class="text-center text-text-secondary py-4">暂无记忆数据</div>
      </div>

      <div class="flex items-center justify-between mt-3 pt-3 border-t border-border-light">
        <div v-if="selectedIds.length" class="text-sm text-text-secondary">
          已选 {{ selectedIds.length }} 条
          <button @click="batchMarkGood" class="ml-3 text-green-600 hover:underline">批量优质</button>
          <button @click="batchMarkBad" class="ml-2 text-red-500 hover:underline">批量废弃</button>
        </div>
        <div class="flex items-center space-x-2 ml-auto">
          <button
            @click="page--"
            :disabled="page === 1"
            class="px-3 py-1 border border-border-light rounded-button disabled:opacity-50"
          >
            上一页
          </button>
          <span class="text-sm text-text-secondary">{{ page }} / {{ totalPages }}</span>
          <button
            @click="page++"
            :disabled="page >= totalPages"
            class="px-3 py-1 border border-border-light rounded-button disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <MemoryDetailDrawer
      v-if="selectedMemory"
      :memory="selectedMemory"
      @close="selectedMemory = null"
      @convert="handleConvert"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Search, Star, ThumbsUp, ThumbsDown } from 'lucide-vue-next'
import { useMemoryStore } from '@/stores/memory'
import MemoryDetailDrawer from './MemoryDetailDrawer.vue'
import type { MemoryEntry } from '@/types'

const store = useMemoryStore()
const { memories, total, currentLayer, layers, layerCounts } = storeToRefs(store)

const keyword = ref('')
const page = ref(1)
const pageSize = 20
const selectedIds = ref<string[]>([])
const selectedMemory = ref<MemoryEntry | null>(null)

const layerNames: Record<string, string> = {
  working: '工作记忆',
  episodic: '情景记忆',
  semantic: '语义记忆',
  procedural: '过程记忆',
  collective: '集体记忆',
}

const totalPages = computed(() => Math.ceil(total.value / pageSize))
const isAllSelected = computed(() => {
  return memories.value.length > 0 && selectedIds.value.length === memories.value.length
})

const selectLayer = (layer: string) => {
  store.currentLayer = layer
  page.value = 1
  fetchData()
}

const search = () => {
  page.value = 1
  fetchData()
}

const fetchData = async () => {
  await store.fetchMemories({
    page: page.value,
    size: pageSize,
    keyword: keyword.value || undefined,
  })
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = memories.value.map(m => m.id)
  }
}

const markGood = (id: string) => store.markQuality(id, 'good')
const markBad = (id: string) => store.markQuality(id, 'bad')
const batchMarkGood = () => store.batchMarkQuality(selectedIds.value, 'good')
const batchMarkBad = () => store.batchMarkQuality(selectedIds.value, 'bad')

const openDetail = (mem: MemoryEntry) => {
  selectedMemory.value = mem
}

const handleConvert = (id: string) => {
  store.convertToProcedural(id)
  selectedMemory.value = null
}

const formatTime = (ts: number) => {
  const date = new Date(ts)
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const strengthColor = (strength: number) => {
  if (strength >= 0.7) return 'bg-green-500'
  if (strength >= 0.3) return 'bg-orange-400'
  return 'bg-red-400'
}

onMounted(async () => {
  await store.fetchLayers()
  await store.fetchLayerCounts?.()   // 如果有此方法则调用
  fetchData()
})

watch(page, fetchData)
</script>
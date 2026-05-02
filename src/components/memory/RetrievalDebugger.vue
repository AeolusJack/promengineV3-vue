<template>
  <div class="h-full flex flex-col">
    <div class="mb-4">
      <div class="relative">
        <Search class="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
        <input
          v-model="query"
          @keyup.enter="debug"
          placeholder="输入查询文本，测试记忆检索..."
          class="w-full pl-11 pr-24 py-3 border border-border-light rounded-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <button
          @click="debug"
          :disabled="!query.trim() || loading"
          class="absolute right-2 top-2 btn-primary px-4 py-1.5 text-sm"
        >
          检索
        </button>
      </div>
    </div>

    <div v-if="result" class="flex-1 overflow-auto space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <SourceCard title="工作记忆" :hits="result.workingHits || []" />
        <SourceCard title="情景记忆" :hits="result.episodicHits || []" />
        <SourceCard title="Lucene" :hits="result.luceneHits || []" />
        <SourceCard title="向量检索" :hits="result.vectorHits || []" />
        <SourceCard title="知识图谱" :hits="result.graphHits || []" />
      </div>

      <div class="card p-4">
        <h4 class="font-medium mb-3">融合结果 (RRF) · 耗时 {{ result.tookMs }}ms</h4>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border-light">
              <th class="py-2 text-left text-text-secondary font-medium">得分</th>
              <th class="py-2 text-left text-text-secondary font-medium">摘要</th>
              <th class="py-2 text-left text-text-secondary font-medium">来源</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="hit in result.fusedHits"
              :key="hit.id"
              class="border-b border-border-light"
            >
              <td class="py-2 font-mono text-primary">{{ hit._score?.toFixed(3) }}</td>
              <td class="py-2 truncate max-w-md">{{ hit.summary || hit.content }}</td>
              <td class="py-2 text-text-secondary">{{ hit._source || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center text-text-secondary">
      输入查询文本，点击检索查看各通路命中详情
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from 'lucide-vue-next'
import { memoryApi } from '@/api/memory'
import SourceCard from './SourceCard.vue'
import type { RetrievalDebugResult } from '@/api/memory'

const query = ref('')
const loading = ref(false)
const result = ref<RetrievalDebugResult | null>(null)

const debug = async () => {
  if (!query.value.trim()) return
  loading.value = true
  try {
    // 现在 debugRetrieval 直接返回 RetrievalDebugResult，无需再 .data
    result.value = await memoryApi.debugRetrieval(query.value.trim())
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>
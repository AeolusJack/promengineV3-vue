import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MemoryEntry } from '@/types'
import { memoryApi } from '@/api/memory'

export const useMemoryStore = defineStore('memory', () => {
  const layers = ref<string[]>([])
  const currentLayer = ref<string>('episodic')
  const memories = ref<MemoryEntry[]>([])
  const total = ref(0)
  const loading = ref(false)
  const selectedMemories = ref<string[]>([])
  const layerCounts = ref<Record<string, number>>({})

  const fetchLayers = async () => {
    try {
      const data = await memoryApi.getLayers()
      layers.value = data.layers || []
      const counts: Record<string, number> = {}
      for (const layer of layers.value) {
        counts[layer] = 0
      }
      layerCounts.value = counts
    } catch (e) {
      console.warn('获取记忆层级失败，使用默认值', e)
      layers.value = ['working', 'episodic', 'semantic', 'procedural', 'collective']
    }
  }

  const fetchLayerCounts = async () => {
    for (const layer of layers.value) {
      try {
        const data = await memoryApi.getMemoriesByLayer(layer, { page: 1, size: 1 })
        layerCounts.value[layer] = data.total || 0
      } catch (e) {
        layerCounts.value[layer] = 0
      }
    }
  }

  const fetchMemories = async (params?: { page?: number; size?: number; keyword?: string }) => {
    loading.value = true
    try {
      const data = await memoryApi.getMemoriesByLayer(currentLayer.value, params)
      memories.value = data.data || []
      total.value = data.total || 0
    } catch (e) {
      console.error('获取记忆失败', e)
      memories.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  const markQuality = async (id: string, action: 'good' | 'bad') => {
    await memoryApi.markQuality(id, action)
    await fetchMemories()   // 标记后自动刷新列表
  }

  const batchMarkQuality = async (ids: string[], action: 'good' | 'bad') => {
    await memoryApi.batchMarkQuality(ids, action)
    selectedMemories.value = []
    await fetchMemories()
  }

  const convertToProcedural = async (id: string) => {
    await memoryApi.convertToProcedural(id)
    await fetchMemories()
  }

  return {
    layers,
    currentLayer,
    memories,
    total,
    loading,
    selectedMemories,
    layerCounts,
    fetchLayers,
    fetchLayerCounts,
    fetchMemories,
    markQuality,
    batchMarkQuality,
    convertToProcedural,
  }
})
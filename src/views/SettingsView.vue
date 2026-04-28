<template>
  <div class="h-full overflow-auto">
    <div class="max-w-3xl mx-auto space-y-6">
      <h2 class="font-medium text-lg mb-4">{{ $t('settings.title') }}</h2>

      <Card class="p-5">
        <h3 class="font-medium mb-4">{{ $t('settings.modelGateway') }}</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('settings.defaultModel') }}</label>
            <select v-model="settings.models.defaultModel" class="w-full input">
              <option value="gemma4-custom:q4">Gemma4 (本地)</option>
              <option value="qwen2.5:14b">Qwen2.5 14B</option>
              <option value="deepseek-v3">DeepSeek V3</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('settings.routingStrategy') }}</label>
            <select v-model="settings.models.routingStrategy" class="w-full input">
              <option value="semantic">语义路由</option>
              <option value="round-robin">轮询</option>
              <option value="load-aware">负载感知</option>
            </select>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm">{{ $t('settings.enableLoadAware') }}</span>
            <Toggle v-model="settings.models.loadAware" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('settings.fallbackChain') }}</label>
            <input v-model="settings.models.fallbackChain" placeholder="siliconflow,aliyun-bailian,local-ollama" class="w-full input" />
          </div>
        </div>
      </Card>

      <Card class="p-5">
        <h3 class="font-medium mb-4">{{ $t('settings.memoryStrategy') }}</h3>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('settings.decayRate') }}</label>
              <input v-model.number="settings.memory.decayRate" type="number" step="0.01" min="0" max="1" class="w-full input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('settings.minStrength') }}</label>
              <input v-model.number="settings.memory.minStrength" type="number" step="0.01" min="0" max="1" class="w-full input" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('settings.decayCron') }}</label>
            <input v-model="settings.memory.decayCron" placeholder="0 0 3 * * ?" class="w-full input" />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm">{{ $t('settings.enableDeduplication') }}</span>
            <Toggle v-model="settings.memory.deduplicationEnabled" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('settings.defaultTopK') }}</label>
              <input v-model.number="settings.memory.defaultTopK" type="number" min="1" max="50" class="w-full input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('settings.verifiedWeightBoost') }}</label>
              <input v-model.number="settings.memory.verifiedWeightBoost" type="number" step="0.1" min="1" max="3" class="w-full input" />
            </div>
          </div>
        </div>
      </Card>

      <Card class="p-5">
        <h3 class="font-medium mb-4">{{ $t('settings.sandbox') }}</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('settings.sandboxType') }}</label>
            <select v-model="settings.sandbox.type" class="w-full input">
              <option value="WASM">WASM</option>
              <option value="DOCKER">Docker</option>
              <option value="DISABLED">禁用</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('settings.workspacePath') }}</label>
            <input v-model="settings.sandbox.workspacePath" class="w-full input" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('settings.wasmModulesPath') }}</label>
            <input v-model="settings.sandbox.wasmModulesPath" class="w-full input" />
          </div>
        </div>
      </Card>

      <Card class="p-5">
        <h3 class="font-medium mb-4">{{ $t('settings.costBudget') }}</h3>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('settings.dailyBudget') }}</label>
              <input v-model.number="settings.budget.daily" type="number" step="0.1" min="0" class="w-full input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('settings.monthlyBudget') }}</label>
              <input v-model.number="settings.budget.monthly" type="number" step="0.1" min="0" class="w-full input" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('settings.alertThresholds') }}</label>
            <input v-model="settings.budget.alertThresholds" placeholder="0.8,0.95" class="w-full input" />
          </div>
        </div>
      </Card>

      <!-- MCP 服务管理 -->
      <Card class="p-5">
        <h3 class="font-medium mb-4">{{ $t('settings.mcpServers') }}</h3>
        <div class="space-y-3">
          <div v-for="server in mcpServers" :key="server.id" class="flex items-center justify-between border-b pb-2">
            <div>
              <div class="text-sm font-medium">{{ server.name }}</div>
              <div class="text-xs text-gray-500">{{ server.url }}</div>
              <span :class="server.connected ? 'text-green-500' : 'text-red-500'" class="text-xs">
                {{ server.connected ? '已连接' : '未连接' }}
              </span>
            </div>
            <button @click="deleteMcpServer(server.id)" class="text-red-500 text-sm">删除</button>
          </div>
          <div v-if="mcpServers.length === 0" class="text-gray-400 text-sm py-2">暂无 MCP 服务</div>
        </div>
        <div class="mt-4 flex items-end space-x-2">
          <div class="flex-1">
            <label class="block text-xs font-medium mb-1">{{ $t('settings.serverName') }}</label>
            <input v-model="newMcpName" class="input" placeholder="My MCP Server" />
          </div>
          <div class="flex-1">
            <label class="block text-xs font-medium mb-1">{{ $t('settings.serverUrl') }}</label>
            <input v-model="newMcpUrl" class="input" placeholder="http://localhost:3000/mcp" />
          </div>
          <button @click="addMcpServer" :disabled="!newMcpName || !newMcpUrl" class="btn-primary text-sm px-3 py-2">
            {{ $t('settings.addServer') }}
          </button>
        </div>
      </Card>


      <div class="flex justify-end space-x-3 pb-6">
        <button @click="resetToDefault" class="btn-secondary">重置为默认</button>
        <button @click="saveSettings" :disabled="saving" class="btn-primary">
          {{ saving ? '保存中...' : '保存配置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from '@/components/ui/Card.vue'
import Toggle from '@/components/ui/Toggle.vue'
import { settingsApi } from '@/api/settings'
import { onBeforeRouteLeave } from 'vue-router'
import { mcpApi } from '@/api/mcp'

const saving = ref(false)

const settings = ref({
  models: {
    defaultModel: 'gemma4-custom:q4',
    routingStrategy: 'semantic',
    loadAware: true,
    fallbackChain: 'siliconflow,aliyun-bailian,local-ollama',
  },
  memory: {
    decayRate: 0.1,
    minStrength: 0.05,
    decayCron: '0 0 3 * * ?',
    deduplicationEnabled: true,
    defaultTopK: 10,
    verifiedWeightBoost: 1.5,
  },
  sandbox: {
    type: 'WASM',
    workspacePath: './sandbox-workspace',
    wasmModulesPath: './wasm-modules',
  },
  budget: {
    daily: 5.0,
    monthly: 50.0,
    alertThresholds: '0.8,0.95',
  },
})

const fetchSettings = async () => {
  const res = await settingsApi.get()
  if (res.data) {
    settings.value = { ...settings.value, ...res.data }
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    await settingsApi.save(settings.value)
    alert('配置已保存')
  } finally {
    saving.value = false
  }
}

const resetToDefault = () => {
  if (confirm('确定重置为默认配置？')) {
    // 重置逻辑
  }
}

interface McpServer {
  id: string
  name: string
  url: string
  enabled: boolean
  connected: boolean
}

const mcpServers = ref<McpServer[]>([])
const newMcpName = ref('')
const newMcpUrl = ref('')

const fetchServers = async () => {
  const res = await mcpApi.listServers()
  mcpServers.value = res.data.data || []
}

const addMcpServer = async () => {
  if (!newMcpName.value || !newMcpUrl.value) return
  await mcpApi.addServer(newMcpName.value, newMcpUrl.value)
  newMcpName.value = ''
  newMcpUrl.value = ''
  await fetchServers()
}

const deleteMcpServer = async (id: string) => {
  if (!confirm('确定删除？')) return
  await mcpApi.deleteServer(id)
  await fetchServers()
}




onMounted(() => {
  fetchSettings()
  fetchServers()
})

const showCreateDrawer = ref(false)
const editingAgent = ref(null)
onBeforeRouteLeave((to, from, next) => {
  showCreateDrawer.value = false
  editingAgent.value = null
  next()
})

</script>
<template>
  <Drawer :visible="true" @close="emit('close')" title="Agent配置">
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div>
        <label class="block text-sm font-medium mb-1">名称</label>
        <input v-model="form.name" type="text" class="w-full input" required />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">描述</label>
        <textarea v-model="form.description" rows="2" class="w-full input"></textarea>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">模式</label>
          <select v-model="form.mode" class="w-full input">
            <option value="silicon">硅基（工具）</option>
            <option value="carbon">碳基（生命体）</option>
          </select>
        </div>
        <div class="flex items-end pb-2">
          <label class="flex items-center">
            <input type="checkbox" v-model="form.isIndependent" class="rounded mr-2" />
            <span class="text-sm">设为独立生命体</span>
          </label>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">系统提示词</label>
        <textarea v-model="form.systemPrompt" rows="5" class="w-full input font-mono text-sm"></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">关联Skill</label>
        <select v-model="form.skills" multiple class="w-full input min-h-24">
          <option v-for="skill in skillStore.skills" :key="skill.id" :value="skill.id">
            {{ skill.name }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">可用工具</label>
        <select v-model="form.tools" multiple class="w-full input min-h-24">
          <option v-for="tool in availableTools" :key="tool" :value="tool">{{ tool }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">主动性级别</label>
        <select v-model="form.proactiveLevel" class="w-full input">
          <option value="none">仅响应</option>
          <option value="query">可追问</option>
          <option value="remind">可主动提醒</option>
        </select>
      </div>
      <div v-if="form.proactiveLevel === 'remind'">
        <label class="block text-sm font-medium mb-1">定时调度 (cron)</label>
        <input v-model="form.schedule" placeholder="0 9 * * *" class="w-full input" />
      </div>
      <div class="flex justify-end space-x-3 pt-4 border-t border-border-light">
        <button type="button" @click="emit('close')" class="btn-secondary">取消</button>
        <button type="submit" class="btn-primary">保存</button>
      </div>
    </form>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Drawer from '@/components/ui/Drawer.vue'
import { useSkillStore } from '@/stores/skill'
import type { AgentConfig } from '@/types'

const props = defineProps<{
  agent?: AgentConfig | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: Partial<AgentConfig>): void
}>()

const skillStore = useSkillStore()

const availableTools = ['calculator', 'read_file', 'write_file', 'list_directory', 'execute_bash']

const form = ref<Partial<AgentConfig>>({
  name: '',
  description: '',
  mode: 'silicon',
  isIndependent: false,
  systemPrompt: '',
  skills: [],
  tools: [],
  proactiveLevel: 'none',
  schedule: '',
})

onMounted(() => {
  skillStore.fetchSkills()
  if (props.agent) {
    form.value = { ...props.agent }
  }
})

const handleSubmit = () => {
  emit('save', form.value)
}
</script>
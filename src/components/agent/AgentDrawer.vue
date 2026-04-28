<template>
  <Drawer :visible="true" @close="emit('close')" :title="$t('agent.titleCreate')">
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('agent.name') }}</label>
        <input v-model="form.name" type="text" class="w-full input" required />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('agent.description') }}</label>
        <textarea v-model="form.description" rows="2" class="w-full input"></textarea>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">{{ $t('agent.mode') }}</label>
          <select v-model="form.mode" class="w-full input">
            <option value="silicon">{{ $t('agent.modeSilicon') }}</option>
            <option value="carbon">{{ $t('agent.modeCarbon') }}</option>
          </select>
        </div>
        <div class="flex items-end pb-2">
          <label class="flex items-center">
            <input type="checkbox" v-model="form.isIndependent" class="rounded mr-2" />
            <span class="text-sm">{{ $t('agent.independentLifeform') }}</span>
          </label>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('agent.systemPrompt') }}</label>
        <textarea v-model="form.systemPrompt" rows="5" class="w-full input font-mono text-sm"></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('agent.associatedSkills') }}</label>
        <select v-model="form.skills" multiple class="w-full input min-h-24">
          <option v-for="skill in (skillStore.skills || [])" :key="skill.id" :value="skill.id">
            {{ skill.name }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('agent.availableTools') }}</label>
        <select v-model="form.tools" multiple class="w-full input min-h-24">
          <option v-for="tool in availableTools" :key="tool" :value="tool">{{ tool }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('agent.proactiveLevel') }}</label>
        <select v-model="form.proactiveLevel" class="w-full input">
          <option value="none">{{ $t('agent.proactiveNone') }}</option>
          <option value="query">{{ $t('agent.proactiveQuery') }}</option>
          <option value="remind">{{ $t('agent.proactiveRemind') }}</option>
        </select>
      </div>
      <div v-if="form.proactiveLevel === 'remind'">
        <label class="block text-sm font-medium mb-1">{{ $t('agent.schedule') }}</label>
        <input v-model="form.schedule" :placeholder="$t('agent.schedulePlaceholder')" class="w-full input" />
      </div>
      <div class="flex justify-end space-x-3 pt-4 border-t border-border-light">
        <button type="button" @click="emit('close')" class="btn-secondary">{{ $t('common.cancel') }}</button>
        <button type="submit" class="btn-primary">{{ $t('common.save') }}</button>
      </div>
    </form>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Drawer from '@/components/ui/Drawer.vue'
import { useSkillStore } from '@/stores/skill'
import type { AgentConfig } from '@/api/agent'

const { t } = useI18n()
const props = defineProps<{ agent?: AgentConfig | null }>()
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
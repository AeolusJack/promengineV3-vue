<template>
  <Drawer :visible="true" @close="emit('close')" title="Skill配置">
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
          <label class="block text-sm font-medium mb-1">版本</label>
          <input v-model="form.version" type="text" class="w-full input" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">来源</label>
          <select v-model="form.source" class="w-full input" :disabled="!!skill">
            <option value="custom">自定义</option>
            <option value="mcp">MCP</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Skill内容 (SKILL.md)</label>
        <textarea
          v-model="form.content"
          rows="12"
          class="w-full input font-mono text-sm"
          placeholder="# Skill名称 ..."
        ></textarea>
      </div>
      <div v-if="skill?.associatedAgents?.length">
        <label class="block text-sm font-medium mb-1">关联Agent</label>
        <div class="text-sm text-text-secondary">
          {{ skill.associatedAgents.join(', ') }}
        </div>
      </div>
      <div class="flex justify-end space-x-3 pt-4 border-t border-border-light">
        <button type="button" @click="emit('close')" class="btn-secondary">取消</button>
        <button type="submit" class="btn-primary">保存</button>
      </div>
    </form>
  </Drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Drawer from '@/components/ui/Drawer.vue'
import type { SkillConfig } from '@/types'

const props = defineProps<{
  skill?: SkillConfig | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: Partial<SkillConfig>): void
}>()

const form = ref<Partial<SkillConfig>>({
  name: '',
  description: '',
  version: '1.0.0',
  source: 'custom',
  content: '',
  ...props.skill,
})

const handleSubmit = () => {
  emit('save', form.value)
}
</script>
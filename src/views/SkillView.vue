<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-medium">Skill 管理</h2>
      <div class="flex items-center space-x-2">
        <button @click="showInstall = true" class="btn-secondary text-sm px-3 py-1.5">
          从MCP安装
        </button>
        <button @click="showCreate = true" class="btn-primary text-sm px-3 py-1.5">
          + 新建Skill
        </button>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <SkillCard
        v-for="skill in skills"
        :key="skill.id"
        :skill="skill"
        @edit="openEdit"
        @toggle="handleToggle"
        @delete="handleDelete"
      />
    </div>

    <SkillDrawer
      v-if="showCreate || editingSkill"
      :skill="editingSkill"
      @close="closeDrawer"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSkillStore } from '@/stores/skill'
import SkillCard from '@/components/skill/SkillCard.vue'
import SkillDrawer from '@/components/skill/SkillDrawer.vue'
import type { SkillConfig } from '@/types'
import { onBeforeRouteLeave } from 'vue-router'

const store = useSkillStore()
const { skills } = store

const showCreate = ref(false)
const showInstall = ref(false)
const editingSkill = ref<SkillConfig | null>(null)

const openEdit = (skill: SkillConfig) => {
  editingSkill.value = skill
}

const closeDrawer = () => {
  showCreate.value = false
  editingSkill.value = null
}

const handleSave = async (data: Partial<SkillConfig>) => {
  if (editingSkill.value) {
    await store.updateSkill(editingSkill.value.id, data)
  } else {
    await store.createSkill(data)
  }
  closeDrawer()
  await store.fetchSkills()
}

const handleToggle = (skill: SkillConfig, enabled: boolean) => {
  store.toggleSkill(skill.id, enabled)
}

const handleDelete = (id: string) => {
  if (confirm('确定删除该Skill？')) {
    store.deleteSkill(id)
  }
}

onMounted(() => {
  store.fetchSkills()
})

const showCreateDrawer = ref(false)
const editingAgent = ref(null)
onBeforeRouteLeave((to, from, next) => {
  showCreateDrawer.value = false
  editingAgent.value = null
  next()
})

</script>
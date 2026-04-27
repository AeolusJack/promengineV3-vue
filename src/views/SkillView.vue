<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-medium">Skill 管理</h2>
      <div class="flex items-center space-x-2">
        <!-- <button @click="showInstall = true" class="btn-secondary text-sm px-3 py-1.5">从MCP安装</button> -->
        <button @click="showCreate = true" class="btn-primary text-sm px-3 py-1.5">+ 新建Skill</button>
      </div>
    </div>

    <div class="flex-1 overflow-auto">
      <div v-if="skills.length === 0" class="text-gray-400 text-center py-10">暂无 Skill，点击右上角创建</div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkillCard
          v-for="skill in skills"
          :key="skill.id"
          :skill="skill"
          @edit="openEdit"
          @toggle="handleToggle"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- 新建/编辑 Skill 抽屉 -->
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
import SkillCard from '@/components/skill/SkillCard.vue'
import SkillDrawer from '@/components/skill/SkillDrawer.vue'
import { skillApi, type SkillConfig } from '@/api/skill'

const skills = ref<SkillConfig[]>([])
const showCreate = ref(false)
const editingSkill = ref<SkillConfig | null>(null)

const fetchSkills = async () => {
  const res = await skillApi.list()
  skills.value = res.data.data || []
}

const closeDrawer = () => {
  showCreate.value = false
  editingSkill.value = null
}

const handleSave = async (data: Partial<SkillConfig>) => {
  if (editingSkill.value) {
    await skillApi.update(editingSkill.value.id, data)
  } else {
    await skillApi.create(data)
  }
  closeDrawer()
  await fetchSkills()
}

const handleToggle = async (skill: SkillConfig, enabled: boolean) => {
  await skillApi.toggle(skill.id, enabled)
  const s = skills.value.find(s => s.id === skill.id)
  if (s) s.enabled = enabled
}

const handleDelete = async (id: string) => {
  if (confirm('确定删除？')) {
    await skillApi.delete(id)
    await fetchSkills()
  }
}

const openEdit = (skill: SkillConfig) => { editingSkill.value = skill }

onMounted(fetchSkills)
</script>
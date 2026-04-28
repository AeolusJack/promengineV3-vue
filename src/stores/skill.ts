import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SkillConfig } from '@/api/skill'
import { skillApi } from '@/api/skill'

export const useSkillStore = defineStore('skill', () => {
  const skills = ref<SkillConfig[]>([])

  const extractData = (res: any) => {
    const body = res.data
    if (body && body.success) return body.data
    return body
  }

  const fetchSkills = async () => {
    const res = await skillApi.list()
    skills.value = extractData(res) || []
  }

  const toggleSkill = async (id: string, enabled: boolean) => {
    await skillApi.toggle(id, enabled)
    const skill = skills.value.find(s => s.id === id)
    if (skill) skill.enabled = enabled
  }

  const createSkill = async (data: Partial<SkillConfig>) => {
    const res = await skillApi.create(data)
    const skill = extractData(res)
    if (skill) skills.value.push(skill)
    return skill
  }

  const updateSkill = async (id: string, data: Partial<SkillConfig>) => {
    const res = await skillApi.update(id, data)
    const updated = extractData(res)
    if (updated) {
      const idx = skills.value.findIndex(s => s.id === id)
      if (idx >= 0) skills.value[idx] = updated
    }
    return updated
  }

  const deleteSkill = async (id: string) => {
    await skillApi.delete(id)
    skills.value = skills.value.filter(s => s.id !== id)
  }

  return { skills, fetchSkills, toggleSkill, createSkill, updateSkill, deleteSkill }
})
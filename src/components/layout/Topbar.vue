<template>
  <header class="h-16 bg-white border-b border-border-light flex items-center justify-between px-6">
    <div class="text-text-secondary text-sm">
      {{ currentPageTitle }}
    </div>
    <div class="flex items-center space-x-4">
       <select
      class="border rounded px-2 py-1 text-sm"
      :value="localeStore.currentLocale"
      @change="handleLocaleChange"
        >
      <option value="zh">中文</option>
      <option value="en">English</option>
    </select>
      <button class="p-2 rounded-full hover:bg-hover-bg transition-colors">
        <Settings class="w-5 h-5 text-text-secondary" />
      </button>
      <div class="flex items-center">
        <img src="@/assets/avatar-default.png" alt="Avatar" class="w-8 h-8 rounded-full" />
      </div>
    </div>
   
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Settings } from 'lucide-vue-next'
import { useLocaleStore } from '@/locales/locale'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()
const localeStore = useLocaleStore()

const handleLocaleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  localeStore.setLocale(target.value as 'zh' | 'en')
}
const route = useRoute()
const currentPageTitle = computed(() => {
  const titles: Record<string, string> = {
    chat: t('sidebar.chat'),
    memory: t('sidebar.memory'),
    agent: t('sidebar.agent'),
    skill: t('sidebar.skill'),
    tools: t('sidebar.tools'),
    settings: t('sidebar.settings'),
  }
  return titles[route.path.split('/')[1]] || t('brand')
})
</script>
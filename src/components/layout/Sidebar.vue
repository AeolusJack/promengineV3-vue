<template>
  <aside class="w-60 bg-white border-r border-border-light flex flex-col">
    <div class="h-16 flex items-center px-4 border-b border-border-light">
      <span class="font-medium text-lg">{{ $t('brand') }}</span>
    </div>
    <nav class="flex-1 p-2">
      <router-link v-for="item in navItems" :key="item.path" :to="item.path"
        class="flex items-center px-3 py-2 rounded-button text-text-secondary hover:bg-hover-bg hover:text-text-primary transition-colors"
        :class="{ 'bg-primary/10 text-primary': $route.path.startsWith(item.path) }">
        <component :is="item.icon" class="w-5 h-5 mr-3" />
        {{ item.label }}
      </router-link>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MessageSquare, Brain, Bot, Package, Wrench, Settings } from 'lucide-vue-next'

const { t } = useI18n()

const navItems = computed(() => [
  { path: '/chat', label: t('sidebar.chat'), icon: MessageSquare },
  { path: '/memory', label: t('sidebar.memory'), icon: Brain },
  { path: '/agent', label: t('sidebar.agent'), icon: Bot },
  { path: '/skill', label: t('sidebar.skill'), icon: Package },
  { path: '/tools', label: t('sidebar.tools'), icon: Wrench },
  { path: '/settings', label: t('sidebar.settings'), icon: Settings },
])
</script>
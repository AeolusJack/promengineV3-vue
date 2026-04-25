<template>
  <aside class="w-60 bg-white border-r border-border-light flex flex-col">
    <div class="h-16 flex items-center px-4 border-b border-border-light">
      <img src="@/assets/logo.png" alt="Logo" class="h-8 w-8 mr-2" />
      <span class="font-medium text-lg">璇玑台</span>
    </div>
    <nav class="flex-1 p-2">
      <template v-for="item in navItems" :key="item.path">
        <router-link
          :to="item.path"
          class="flex items-center px-3 py-2 rounded-button text-text-secondary hover:bg-hover-bg hover:text-text-primary transition-colors"
          :class="{ 'bg-primary/10 text-primary': $route.path.startsWith(item.path) }"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
        </router-link>
      </template>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { MessageSquare, Brain, Bot, Package, Wrench, Settings } from 'lucide-vue-next'

const navItems = [
  { name: '对话', path: '/chat', icon: MessageSquare },
  { name: '记忆', path: '/memory', icon: Brain },
  { name: 'Agent', path: '/agent', icon: Bot },
  { name: 'Skill', path: '/skill', icon: Package },
  { name: '工具', path: '/tools', icon: Wrench },
  { name: '配置', path: '/settings', icon: Settings },
]
</script>
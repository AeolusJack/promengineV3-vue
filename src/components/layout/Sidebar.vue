<template>
  <aside class="w-60 bg-bg-secondary flex flex-col h-full">
    <!-- 品牌标识 -->
    <div class="h-16 flex items-center px-4 space-x-2">
      <ThirdExplorationLogo :size="24" color="#2563EB" />
      <span class="brand-text text-primary">{{ $t('brand') }}</span>
    </div>

    <!-- 导航菜单 -->
    <nav class="px-2 pb-2">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center px-3 py-2 rounded-button text-text-secondary hover:bg-white hover:text-text-primary transition-colors"
        :class="{ 'bg-white text-primary shadow-sm': $route.path.startsWith(item.path) }"
      >
        <component :is="item.icon" class="w-5 h-5 mr-3" />
        {{ item.label }}
      </router-link>
    </nav>

    <!-- 用户信息区域 -->
    <div class="mt-auto px-3 pb-4 relative">
      <div
        class="flex items-center space-x-3 p-2 rounded-xl hover:bg-white cursor-pointer transition-colors"
        @click="toggleMenu"
      >
        <img
          :src="userAvatar"
          alt="Avatar"
          class="w-8 h-8 rounded-full object-cover border border-border-light"
        />
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium truncate">{{ nickname }}</div>
          <div class="text-xs text-text-secondary truncate">{{ username }}</div>
        </div>
        <ChevronUp v-if="showLogoutMenu" class="w-4 h-4 text-text-secondary" />
        <ChevronDown v-else class="w-4 h-4 text-text-secondary" />
      </div>

      <Transition name="fade">
        <div
          v-if="showLogoutMenu"
          class="absolute left-3 right-3 bottom-full mb-2 bg-white border border-border-light rounded-xl shadow-lg z-50 overflow-hidden"
        >
          <button
            @click="logout"
            class="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut class="w-4 h-4" />
            <span>{{ $t('auth.logout') }}</span>
          </button>
        </div>
      </Transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  MessageSquare,
  Brain,
  Bot,
  Package,
  Wrench,
  Settings,
  ChevronUp,
  ChevronDown,
  LogOut,
  Sparkles,   // ★ 关键补充
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import ThirdExplorationLogo from '@/components/icons/ThirdExplorationLogo.vue'
const { t } = useI18n()
const router = useRouter()
const nickname = ref('')
const username = ref('')
const showLogoutMenu = ref(false)

const userAvatar = computed(() => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username.value || 'user'}`
})

const navItems = computed(() => [
  { path: '/chat',   label: t('sidebar.chat'),    icon: MessageSquare },
  { path: '/memory', label: t('sidebar.memory'),  icon: Brain },
  { path: '/agent',  label: t('sidebar.agent'),   icon: Bot },
  { path: '/skill',  label: t('sidebar.skill'),   icon: Package },
  { path: '/tools',  label: t('sidebar.tools'),   icon: Wrench },
  { path: '/settings', label: t('sidebar.settings'), icon: Settings },
])

const toggleMenu = () => {
  showLogoutMenu.value = !showLogoutMenu.value
}

const closeMenu = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).closest('.relative')) {
    showLogoutMenu.value = false
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('username')
  localStorage.removeItem('nickname')
  showLogoutMenu.value = false
  router.push('/login')
}

onMounted(() => {
  nickname.value = localStorage.getItem('nickname') || t('auth.defaultNickname')
  username.value = localStorage.getItem('username') || ''
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})
</script>

<style scoped>
.brand-text {
  font-family: 'Georgia', 'Times New Roman', 'STSong', 'SimSun', 'Songti SC', serif;
  font-weight: 800; /* 介于 500-600 之间，不过细也不过粗 */
  font-size: 1.3rem;
  letter-spacing: 0.08em;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <!-- 装饰性背景 -->
    <div class="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

    <!-- 主卡片 -->
    <div class="relative w-full max-w-md mx-4">
      <!-- 品牌标识 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/20 mb-4">
          <Bot class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-semibold text-text-primary">{{ isLogin ? $t('auth.welcomeBack') : $t('auth.createAccount') }}</h1>
        <p class="text-sm text-text-secondary mt-1">{{ isLogin ? $t('auth.loginSubtitle') : $t('auth.registerSubtitle') }}</p>
      </div>

      <!-- 表单卡片 -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.02] border border-border-light p-8">
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- 用户名 -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1.5">{{ $t('auth.username') }}</label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                v-model="form.username"
                type="text"
                :placeholder="$t('auth.usernamePlaceholder')"
                class="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          <!-- 密码 -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1.5">{{ $t('auth.password') }}</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="$t('auth.passwordPlaceholder')"
                class="w-full pl-10 pr-10 py-2.5 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
              >
                <Eye v-if="!showPassword" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- 昵称 (仅注册) -->
          <div v-if="!isLogin">
            <label class="block text-sm font-medium text-text-primary mb-1.5">{{ $t('auth.nickname') }}</label>
            <div class="relative">
              <Smile class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                v-model="form.nickname"
                type="text"
                :placeholder="$t('auth.nicknamePlaceholder')"
                class="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <!-- 错误提示 -->
          <div v-if="error" class="flex items-center space-x-2 bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl">
            <AlertCircle class="w-4 h-4 flex-shrink-0" />
            <span>{{ error }}</span>
          </div>

          <!-- 提交按钮 -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <Loader2 class="w-4 h-4 animate-spin mr-2" />
              {{ isLogin ? $t('auth.signingIn') : $t('auth.creating') }}
            </span>
            <span v-else>{{ isLogin ? $t('auth.signIn') : $t('auth.signUp') }}</span>
          </button>
        </form>
      </div>

      <!-- 切换模式 -->
      <div class="text-center mt-6">
        <p class="text-sm text-text-secondary">
          {{ isLogin ? $t('auth.noAccount') : $t('auth.hasAccount') }}
          <button
            @click="toggleMode"
            class="text-primary hover:underline font-medium ml-1"
          >
            {{ isLogin ? $t('auth.goToRegister') : $t('auth.goToLogin') }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Bot, User, Lock, Eye, EyeOff, AlertCircle, Loader2, Smile } from 'lucide-vue-next'
import axios from 'axios'

const { t } = useI18n()
const router = useRouter()

const isLogin = ref(true)
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const form = ref({
  username: '',
  password: '',
  nickname: ''
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = ''
  form.value = { username: '', password: '', nickname: '' }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const url = isLogin.value ? '/api/auth/login' : '/api/auth/register'
    const payload: Record<string, string> = {
      username: form.value.username,
      password: form.value.password
    }
    if (!isLogin.value) {
      payload.nickname = form.value.nickname || form.value.username
    }
    
    const res = await axios.post(url, payload)
    const data = res.data
    
    if (data.success) {
      if (isLogin.value) {
        const { token, userId, username, nickname } = data.data
        localStorage.setItem('token', token)
        localStorage.setItem('userId', userId)
        localStorage.setItem('username', username)
        localStorage.setItem('nickname', nickname || username)
        router.push('/chat')
      } else {
        // 注册成功，自动切换回登录
        error.value = ''
        isLogin.value = true
        // 可显示提示，或直接切换到登录
      }
    } else {
      error.value = data.error || t('auth.unknownError')
    }
  } catch (e: any) {
    error.value = e.response?.data?.error || t('auth.networkError')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 如有需要可添加自定义动画 */
</style>
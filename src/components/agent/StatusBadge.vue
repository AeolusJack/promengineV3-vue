<template>
  <span class="inline-flex items-center">
    <span :class="['w-2 h-2 rounded-full mr-1', statusConfig[status].color]" />
    <span class="text-xs text-text-secondary">{{ $t(`agent.status${capitalize(status)}`) }}</span>
  </span>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
defineProps<{ status: 'active' | 'thinking' | 'resting' | 'inactive' }>()

const statusConfig = {
  active: { color: 'bg-green-500' },
  thinking: { color: 'bg-yellow-500' },
  resting: { color: 'bg-gray-400' },
  inactive: { color: 'bg-gray-300' },
}

// 简单的首字母大写辅助
function capitalize(s: string): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}
</script>
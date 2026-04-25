<template>
  <span class="inline-flex items-center">
    <span
      :class="[
        'w-2 h-2 rounded-full mr-1',
        statusConfig[status].color,
      ]"
    />
    <span class="text-xs text-text-secondary">{{ statusConfig[status].label }}</span>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  status: 'active' | 'thinking' | 'resting' | 'inactive'
}>()

const statusConfig = {
  active: { color: 'bg-green-500', label: '活跃' },
  thinking: { color: 'bg-yellow-500', label: '思考中' },
  resting: { color: 'bg-gray-400', label: '休息' },
  inactive: { color: 'bg-gray-300', label: '未启用' },
}
</script>
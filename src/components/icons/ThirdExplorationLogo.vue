<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="inline-block"
  >
    <!-- 身体部分（流线型曲线） -->
    <path
      d="M6 20 C6 14, 12 8, 20 8 C24 8, 28 12, 28 16 C28 22, 22 26, 16 26 C10 26, 6 24, 6 20Z"
      :stroke="color"
      stroke-width="2.2"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
    <!-- 翅膀（柔和弧线） -->
    <path
      d="M16 16 C14 12, 10 10, 8 8"
      :stroke="color"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- 眼睛（圆点） -->
    <circle cx="20" cy="15" r="2" :fill="color" />
    <!-- 喙（小三角形，但用圆角表现柔和） -->
    <path
      d="M24 15 L26 14 L25 16Z"
      :fill="color"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: number
  color?: string
}>(), {
  size: 24,
  color: '#2563EB',
})
</script>
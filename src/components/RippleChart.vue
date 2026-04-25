<template>
  <div class="flex items-center space-x-1">
    <div
      v-for="(event, index) in recentEvents"
      :key="event.timestamp"
      class="w-1.5 rounded-full transition-all duration-300"
      :class="{
        'bg-green-500': event.color === 'green',
        'bg-orange-400': event.color === 'orange',
        'bg-red-500': event.color === 'red',
      }"
      :style="{ height: `${8 + event.entropy * 16}px` }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RippleEvent } from '@/types'

const props = defineProps<{
  events: RippleEvent[]
}>()

const recentEvents = computed(() => {
  return props.events.slice(-20)
})
</script>
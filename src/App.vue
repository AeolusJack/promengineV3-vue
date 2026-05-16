<template>
  <LoginView v-if="$route.path === '/login'" />
  <AppLayout v-else />
</template>

<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import LoginView from '@/views/LoginView.vue'
</script>
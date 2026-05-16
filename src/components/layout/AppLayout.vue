<template>
  <div class="flex h-screen overflow-hidden bg-white">
    <Sidebar />
    <div class="flex-1 flex flex-col min-w-0 bg-white">
      <Topbar />
      <main class="flex-1 overflow-auto p-6 bg-white">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
</script>
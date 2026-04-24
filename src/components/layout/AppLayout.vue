<template>
  <div class="layout">
    <AppHeader />
    <div class="layout-body">
      <AppSidebar />
      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.layout-content {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}
</style>

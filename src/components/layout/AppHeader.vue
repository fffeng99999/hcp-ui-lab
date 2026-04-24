<template>
  <header class="header">
    <div class="header-left">
      <span class="logo">🔬</span>
      <h1 class="title">HCP Lab 实验平台</h1>
    </div>
    <div class="header-right">
      <el-tag type="success" size="small">v1.0.0</el-tag>
    </div>
  </header>
</template>

<script setup lang="ts">
</script>

<style scoped>
.header {
  height: 56px;
  background-color: #0f172a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo {
  font-size: 24px;
}
.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>

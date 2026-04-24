<template>
  <aside class="sidebar">
    <nav>
      <ul>
        <li
          v-for="item in menu"
          :key="item.path"
          :class="{ active: route.path === item.path }"
          @click="go(item.path)"
        >
          <span class="icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const menu = [
  { path: '/experiments', label: '实验列表', icon: '🧪' },
  { path: '/tasks', label: '任务管理', icon: '📋' },
]

function go(path: string) {
  if (path !== route.path) router.push(path)
}
</script>

<style scoped>
.sidebar {
  width: 200px;
  background-color: #0f172a;
  color: #94a3b8;
  flex-shrink: 0;
  overflow-y: auto;
}
.sidebar ul {
  list-style: none;
  padding: 12px 0;
  margin: 0;
}
.sidebar li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}
.sidebar li:hover {
  color: #fff;
  background-color: #1e293b;
}
.sidebar li.active {
  color: #fff;
  background-color: #2563eb;
}
.icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}
</style>

<template>
  <div class="experiments-page">
    <div style="background: red; color: white; padding: 20px; margin-bottom: 20px; font-size: 20px; font-weight: bold;">
      🔴 DEBUG: If you see this red box, the component IS rendering!
    </div>
    
    <h2 class="page-title">实验列表</h2>
    
    <el-row :gutter="20">
      <el-col 
        v-for="exp in experiments" 
        :key="exp.id" 
        :xs="24" :sm="12" :md="8" :lg="6"
      >
        <el-card class="experiment-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="exp-name">{{ exp.name }}</span>
              <el-tag size="small" type="info">{{ exp.id }}</el-tag>
            </div>
          </template>
          <p class="exp-desc">{{ exp.description }}</p>
          <div class="card-actions">
            <el-button type="primary" size="small" @click="goConfig(exp.id)">
              配置实验
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const experiments = [
  {
    id: 'exp1',
    name: 'Test Experiment 1',
    description: 'This is a test experiment',
  },
  {
    id: 'exp2', 
    name: 'Test Experiment 2',
    description: 'Another test experiment',
  },
  {
    id: 'exp3',
    name: 'Test Experiment 3', 
    description: 'Yet another test experiment',
  }
]

function goConfig(id: string) {
  router.push(`/experiments/${id}/config`)
}
</script>

<style scoped>
.experiments-page { padding: 20px; }
.page-title { margin-bottom: 20px; font-size: 24px; }
.experiment-card { margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.exp-name { font-weight: bold; font-size: 16px; }
.exp-desc { color: #666; margin: 10px 0; font-size: 14px; line-height: 1.5; }
.card-actions { display: flex; justify-content: flex-end; }
</style>

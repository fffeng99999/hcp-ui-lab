<template>
  <div class="experiments-page">
    <div class="page-header">
      <h2 class="page-title">实验列表</h2>
      <el-button type="primary" @click="goGenerate">
        <el-icon><MagicStick /></el-icon>
        AI生成实验
      </el-button>
    </div>
    
    <el-row :gutter="20">
      <el-col 
        v-for="exp in experimentStore.experiments" 
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

    <el-alert v-if="experimentStore.error" :title="experimentStore.error" type="error" show-icon closable class="error-alert" />

    <el-empty v-if="experimentStore.experiments.length === 0 && !experimentStore.isLoading" :description="experimentStore.error ? '加载失败，请检查后端服务' : '暂无实验数据'" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useExperimentStore } from '@/store/modules/experiment'
import { onMounted } from 'vue'
import { MagicStick } from '@element-plus/icons-vue'

const router = useRouter()
const experimentStore = useExperimentStore()

onMounted(() => {
  experimentStore.loadExperiments()
})

function goConfig(id: string) {
  router.push(`/experiments/${id}/config`)
}

function goGenerate() {
  router.push('/experiments/generate')
}
</script>

<style scoped>
.experiments-page { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { margin: 0; font-size: 24px; }
.error-alert { margin-bottom: 16px; }
.experiment-card { margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.exp-name { font-weight: bold; font-size: 16px; }
.exp-desc { color: #666; margin: 10px 0; font-size: 14px; line-height: 1.5; }
.card-actions { display: flex; justify-content: flex-end; }
</style>

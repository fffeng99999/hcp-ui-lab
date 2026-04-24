<template>
  <div class="experiments-page">
    <h2 class="page-title">实验列表</h2>
    <el-row :gutter="20">
      <el-col
        v-for="exp in experimentStore.experiments"
        :key="exp.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card class="experiment-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="exp-name">{{ exp.name }}</span>
              <el-tag size="small" type="info">{{ exp.id }}</el-tag>
            </div>
          </template>
          <p class="exp-desc">{{ exp.description }}</p>
          <div class="exp-meta">
            <el-tag size="small" type="success">{{ exp.params.length }} 个参数</el-tag>
          </div>
          <div class="card-actions">
            <el-button type="primary" size="small" @click="goConfig(exp.id)">
              <el-icon><Setting /></el-icon> 配置实验
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExperimentStore } from '@/store/modules/experiment'
import { Setting } from '@element-plus/icons-vue'

const router = useRouter()
const experimentStore = useExperimentStore()

onMounted(() => {
  experimentStore.loadExperiments()
})

function goConfig(id: string) {
  router.push(`/experiments/${id}/config`)
}
</script>

<style scoped>
.page-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}
.experiment-card {
  margin-bottom: 20px;
  transition: transform 0.2s;
}
.experiment-card:hover {
  transform: translateY(-4px);
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}
.exp-name {
  font-size: 15px;
}
.exp-desc {
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
  min-height: 40px;
  margin: 0 0 12px 0;
}
.exp-meta {
  margin-bottom: 12px;
}
.card-actions {
  display: flex;
  justify-content: flex-end;
}
</style>

<template>
  <div class="tasks-page">
    <h2 class="page-title">任务管理</h2>
    
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>实验任务列表</span>
          <div class="header-actions">
            <el-radio-group v-model="statusFilter" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="running">运行中</el-radio-button>
              <el-radio-button label="completed">已完成</el-radio-button>
              <el-radio-button label="failed">失败</el-radio-button>
            </el-radio-group>
            <el-button size="small" @click="refresh" :loading="experimentStore.isLoading">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="filteredTasks" stripe v-loading="experimentStore.isLoading">
        <el-table-column prop="id" label="任务ID" width="220" show-overflow-tooltip />
        <el-table-column prop="exp_name" label="实验名称" width="200" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="180">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :status="row.status === 'failed' ? 'exception' : undefined" />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewResult(row.id)">查看结果</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { useExperimentStore } from '@/store/modules/experiment'

const router = useRouter()
const experimentStore = useExperimentStore()

const statusFilter = ref('all')

const filteredTasks = computed(() => {
  if (statusFilter.value === 'all') return experimentStore.tasks
  return experimentStore.tasks.filter(t => t.status === statusFilter.value)
})

function statusType(status: string) {
  const map: Record<string, string> = {
    pending: 'info',
    running: 'primary',
    completed: 'success',
    failed: 'danger',
    cancelled: 'warning'
  }
  return map[status] || 'info'
}

function formatTime(t?: string) {
  if (!t) return '-'
  return new Date(t).toLocaleString('zh-CN')
}

function refresh() {
  experimentStore.loadTasks()
}

function viewResult(id: string) {
  router.push(`/tasks/${id}/results`)
}

async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定删除该任务记录吗？', '提示', { type: 'warning' })
    await experimentStore.removeTask(id)
    ElMessage.success('删除成功')
  } catch (err) {
    // cancel
  }
}

onMounted(() => {
  experimentStore.loadTasks()
})
</script>

<style scoped>
.page-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>

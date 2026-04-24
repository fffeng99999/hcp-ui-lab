<template>
  <div class="result-page">
    <el-page-header @back="goBack" :title="task?.exp_name || '实验结果'" />
    
    <div v-if="task" class="task-info">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>任务信息</span>
            <el-tag :type="statusType(task.status)">{{ task.status }}</el-tag>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务ID">{{ task.id }}</el-descriptions-item>
          <el-descriptions-item label="实验">{{ task.exp_name }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(task.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="进度">
            <el-progress :percentage="task.progress" :status="task.status === 'failed' ? 'exception' : undefined" />
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <!-- Real-time logs -->
    <el-card v-if="logs.length > 0" class="logs-card">
      <template #header>
        <span>实时日志</span>
      </template>
      <div class="logs-container">
        <div v-for="(log, idx) in logs" :key="idx" class="log-line">{{ log }}</div>
      </div>
    </el-card>

    <!-- Metrics -->
    <el-card v-if="metricsPoints.length > 0" class="metrics-card">
      <template #header>
        <span>实验指标</span>
      </template>
      <el-table :data="metricsPoints" stripe size="small">
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-descriptions :column="3" border size="small">
              <el-descriptions-item
                v-for="(val, key) in row.metrics"
                :key="key"
                :label="key"
              >
                {{ formatNumber(val) }}
              </el-descriptions-item>
            </el-descriptions>
          </template>
        </el-table-column>
        <el-table-column prop="params" label="参数">
          <template #default="{ row }">
            <el-tag v-for="(val, key) in row.params" :key="key" size="small" style="margin-right: 6px">
              {{ key }}: {{ val }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时(s)" width="120">
          <template #default="{ row }">
            {{ formatNumber(row.metrics?.duration_s) }}
          </template>
        </el-table-column>
        <el-table-column prop="tps" label="TPS" width="120">
          <template #default="{ row }">
            {{ formatNumber(row.metrics?.tps) }}
          </template>
        </el-table-column>
        <el-table-column prop="latency" label="平均延迟(ms)" width="140">
          <template #default="{ row }">
            {{ formatNumber(row.metrics?.avg_confirm_time_ms) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- SVG Figures -->
    <el-card v-if="svgFiles.length > 0" class="figures-card">
      <template #header>
        <span>图表</span>
      </template>
      <el-row :gutter="20">
        <el-col v-for="file in svgFiles" :key="file" :xs="24" :sm="24" :md="12">
          <div class="figure-item">
            <h4>{{ file }}</h4>
            <img :src="getResultFileUrl(taskId, file)" :alt="file" class="figure-img" />
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- Error -->
    <el-card v-if="task?.error_msg" class="error-card">
      <template #header>
        <span>错误信息</span>
      </template>
      <el-alert :title="task.error_msg" type="error" show-icon :closable="false" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTask, getResultFileUrl } from '@/api/experiment'
import { WS_URL } from '@/api/config'
import type { Task } from '@/types'

const route = useRoute()
const router = useRouter()
const taskId = route.params.id as string

const task = ref<Task | null>(null)
const logs = ref<string[]>([])
const ws = ref<WebSocket | null>(null)

const metricsPoints = computed(() => {
  const metrics = task.value?.metrics
  if (!metrics || !Array.isArray(metrics.points)) return []
  return metrics.points
})

const svgFiles = computed(() => {
  if (!task.value?.result_files) return []
  return task.value.result_files.filter(f => f.endsWith('.svg'))
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

function formatNumber(v: any) {
  if (v === undefined || v === null) return '-'
  const n = Number(v)
  if (isNaN(n)) return v
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 4 })
}

function goBack() {
  router.push('/tasks')
}

async function loadTask() {
  try {
    task.value = await getTask(taskId)
  } catch (err) {
    console.error('加载任务失败', err)
  }
}

function connectWS() {
  const socket = new WebSocket(WS_URL)
  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      if (msg.task_id === taskId) {
        if (msg.type === 'log') {
          logs.value.push(msg.payload)
          if (logs.value.length > 500) logs.value.shift()
        }
        if (msg.type === 'completed' || msg.type === 'error') {
          loadTask()
        }
      }
    } catch (e) {
      // ignore
    }
  }
  socket.onopen = () => console.log('WS connected')
  socket.onclose = () => console.log('WS disconnected')
  ws.value = socket
}

onMounted(() => {
  loadTask()
  connectWS()
  const interval = setInterval(loadTask, 5000)
  onUnmounted(() => {
    clearInterval(interval)
    ws.value?.close()
  })
})
</script>

<style scoped>
.result-page {
  max-width: 1200px;
}
.task-info {
  margin-top: 20px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}
.logs-card,
.metrics-card,
.figures-card,
.error-card {
  margin-top: 20px;
}
.logs-container {
  background: #0f172a;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.6;
}
.log-line {
  white-space: pre-wrap;
  word-break: break-all;
}
.figure-item {
  margin-bottom: 16px;
}
.figure-item h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #475569;
}
.figure-img {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
}
</style>

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
          <el-descriptions-item label="完成时间">{{ task.finished_at ? formatTime(task.finished_at) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="进度" :span="2">
            <el-progress :percentage="task.progress" :status="task.status === 'failed' ? 'exception' : undefined" />
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <el-card v-if="task?.params && Object.keys(task.params).length > 0" class="params-card">
      <template #header>
        <span>实验参数</span>
      </template>
      <el-descriptions :column="3" border size="small">
        <el-descriptions-item
          v-for="(val, key) in task.params"
          :key="key"
          :label="key"
        >
          {{ val }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-if="logs.length > 0" class="logs-card">
      <template #header>
        <div class="card-header">
          <span>实时日志</span>
          <el-button size="small" @click="logs = []">清空</el-button>
        </div>
      </template>
      <div class="logs-container" ref="logsContainerRef">
        <div v-for="(log, idx) in logs" :key="idx" class="log-line">{{ log }}</div>
      </div>
    </el-card>

    <el-card v-if="task?.metrics && Object.keys(task.metrics).length > 0" class="metrics-card">
      <template #header>
        <span>实验指标</span>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item
          v-for="(val, key) in task.metrics"
          :key="key"
          :label="key"
        >
          {{ formatMetricValue(val) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-if="svgFiles.length > 0" class="figures-card">
      <template #header>
        <span>实验图表 ({{ svgFiles.length }})</span>
      </template>
      <el-row :gutter="20">
        <el-col v-for="file in svgFiles" :key="file" :xs="24" :sm="24" :md="12" :lg="8">
          <div class="figure-item">
            <h4>{{ formatFileName(file) }}</h4>
            <div class="figure-wrapper">
              <img :src="getResultFileUrl(taskId, file)" :alt="file" class="figure-img" />
            </div>
            <el-button size="small" text type="primary" @click="downloadFile(file)">下载</el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card v-if="markdownFile" class="report-card">
      <template #header>
        <span>实验报告</span>
      </template>
      <div class="markdown-content" v-html="markdownContent"></div>
    </el-card>

    <el-card v-if="resultJsonFile" class="json-card">
      <template #header>
        <div class="card-header">
          <span>结果数据 (result.json)</span>
          <el-button size="small" @click="showJsonData = !showJsonData">
            {{ showJsonData ? '隐藏' : '显示' }}
          </el-button>
        </div>
      </template>
      <pre v-if="showJsonData" class="json-content">{{ jsonContent }}</pre>
    </el-card>

    <el-card v-if="otherFiles.length > 0" class="files-card">
      <template #header>
        <span>其他结果文件 ({{ otherFiles.length }})</span>
      </template>
      <el-table :data="otherFiles" stripe size="small">
        <el-table-column prop="name" label="文件名" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="downloadFile(row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-if="task?.error_msg" class="error-card">
      <template #header>
        <span>错误信息</span>
      </template>
      <el-alert :title="task.error_msg" type="error" show-icon :closable="false" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTask, getResultFileUrl } from '@/api/experiment'
import { API_BASE_URL } from '@/api/config'
import type { Task } from '@/types'

const route = useRoute()
const router = useRouter()
const taskId = route.params.id as string

const task = ref<Task | null>(null)
const logs = ref<string[]>([])
const ws = ref<WebSocket | null>(null)
const logsContainerRef = ref<HTMLElement | null>(null)
const markdownContent = ref('')
const jsonContent = ref('')
const showJsonData = ref(false)

const svgFiles = computed(() => {
  if (!task.value?.result_files) return []
  return task.value.result_files.filter(f => f.endsWith('.svg'))
})

const markdownFile = computed(() => {
  if (!task.value?.result_files) return null
  return task.value.result_files.find(f => f.endsWith('.md')) || null
})

const resultJsonFile = computed(() => {
  if (!task.value?.result_files) return null
  return task.value.result_files.find(f => f.endsWith('result.json')) || null
})

const otherFiles = computed(() => {
  if (!task.value?.result_files) return []
  return task.value.result_files
    .filter(f => !f.endsWith('.svg') && !f.endsWith('.md') && !f.endsWith('result.json') && !f.endsWith('.aux') && !f.endsWith('.log'))
    .map(f => ({ name: f, path: f }))
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

function formatMetricValue(val: any): string {
  if (val === null || val === undefined) return '-'
  if (typeof val === 'object') {
    return JSON.stringify(val, null, 2)
  }
  if (typeof val === 'number') {
    return formatNumber(val)
  }
  return String(val)
}

function formatFileName(file: string): string {
  return file.replace(/^.*[\\/]/, '').replace(/\.[^.]+$/, '')
}

function goBack() {
  router.push('/tasks')
}

async function loadTask() {
  try {
    const oldStatus = task.value?.status
    task.value = await getTask(taskId)
    
    if (task.value?.status === 'completed' && oldStatus !== 'completed') {
      await loadMarkdown()
      await loadJson()
    }
  } catch (err) {
    console.error('加载任务失败', err)
  }
}

async function loadMarkdown() {
  if (!markdownFile.value) return
  try {
    const url = getResultFileUrl(taskId, markdownFile.value)
    const resp = await fetch(url)
    markdownContent.value = await resp.text()
  } catch (err) {
    console.error('加载报告失败', err)
  }
}

async function loadJson() {
  if (!resultJsonFile.value) return
  try {
    const url = getResultFileUrl(taskId, resultJsonFile.value)
    const resp = await fetch(url)
    const data = await resp.json()
    jsonContent.value = JSON.stringify(data, null, 2)
  } catch (err) {
    console.error('加载JSON失败', err)
  }
}

function downloadFile(file: string | { path: string }) {
  const path = typeof file === 'string' ? file : file.path
  const url = getResultFileUrl(taskId, path)
  window.open(url, '_blank')
}

function scrollToBottom() {
  nextTick(() => {
    if (logsContainerRef.value) {
      logsContainerRef.value.scrollTop = logsContainerRef.value.scrollHeight
    }
  })
}

function connectWS() {
  const wsUrl = `ws://${window.location.hostname}:9090/ws`
  const socket = new WebSocket(wsUrl)
  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      if (msg.task_id === taskId) {
        if (msg.type === 'log') {
          logs.value.push(msg.payload)
          if (logs.value.length > 1000) logs.value.shift()
          scrollToBottom()
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
  socket.onclose = () => {
    console.log('WS disconnected, reconnecting...')
    setTimeout(connectWS, 3000)
  }
  ws.value = socket
}

onMounted(() => {
  loadTask()
  connectWS()
  const interval = setInterval(loadTask, 3000)
  onUnmounted(() => {
    clearInterval(interval)
    ws.value?.close()
  })
})
</script>

<style scoped>
.result-page {
  max-width: 1400px;
}
.task-info,
.params-card,
.logs-card,
.metrics-card,
.figures-card,
.report-card,
.json-card,
.files-card,
.error-card {
  margin-top: 20px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}
.logs-container {
  background: #0f172a;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
}
.log-line {
  white-space: pre-wrap;
  word-break: break-all;
}
.figure-item {
  margin-bottom: 20px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}
.figure-item h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #334155;
  font-weight: 600;
}
.figure-wrapper {
  background: #f8fafc;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 8px;
}
.figure-img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}
.markdown-content {
  padding: 16px;
  background: #f8fafc;
  border-radius: 6px;
  line-height: 1.8;
}
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin-top: 24px;
  margin-bottom: 12px;
  color: #1e293b;
}
.markdown-content :deep(p) {
  margin: 8px 0;
  color: #475569;
}
.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}
.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  text-align: left;
}
.markdown-content :deep(th) {
  background: #f1f5f9;
  font-weight: 600;
}
.json-content {
  background: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 6px;
  max-height: 500px;
  overflow: auto;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}
</style>

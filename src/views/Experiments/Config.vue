<template>
  <div class="config-page">
    <el-page-header @back="goBack" :title="experiment?.name || '实验配置'" />
    
    <el-card class="config-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>参数配置</span>
          <el-tag type="warning">{{ experiment?.id }}</el-tag>
        </div>
      </template>
      
      <p class="desc">{{ experiment?.description }}</p>
      
      <el-form
        ref="formRef"
        :model="formData"
        label-width="200px"
        class="config-form"
      >
        <el-form-item
          v-for="param in experiment?.params"
          :key="param.name"
          :label="param.description"
          :prop="param.name"
          :rules="param.required ? [{ required: true, message: `请输入${param.description}`, trigger: 'blur' }] : []"
        >
          <!-- bool -->
          <el-switch
            v-if="param.type === 'bool'"
            v-model="formData[param.name]"
            :active-value="true"
            :inactive-value="false"
          />
          
          <!-- int -->
          <el-input-number
            v-else-if="param.type === 'int'"
            v-model="formData[param.name]"
            :placeholder="String(param.default)"
            controls-position="right"
            style="width: 200px"
          />
          
          <!-- float -->
          <el-input-number
            v-else-if="param.type === 'float'"
            v-model="formData[param.name]"
            :placeholder="String(param.default)"
            :precision="2"
            :step="0.1"
            controls-position="right"
            style="width: 200px"
          />
          
          <!-- list_int -->
          <el-input
            v-else-if="param.type === 'list_int'"
            v-model="formData[param.name]"
            :placeholder="String(param.default)"
            clearable
          >
            <template #append>逗号分隔</template>
          </el-input>
          
          <!-- string -->
          <el-input
            v-else
            v-model="formData[param.name]"
            :placeholder="String(param.default)"
            clearable
          />
          
          <div class="param-hint">
            参数名: <code>{{ param.name }}</code> | 类型: <code>{{ param.type }}</code>
            | 默认值: <code>{{ param.default }}</code>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitRun" :loading="experimentStore.isLoading">
            <el-icon><VideoPlay /></el-icon> 运行实验
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { VideoPlay } from '@element-plus/icons-vue'
import { useExperimentStore } from '@/store/modules/experiment'
import { getExperiment } from '@/api/experiment'
import type { Experiment } from '@/types'

const route = useRoute()
const router = useRouter()
const experimentStore = useExperimentStore()

const expId = route.params.id as string
const experiment = ref<Experiment | null>(null)
const loading = ref(false)
const formRef = ref<any>(null)
const formData = reactive<Record<string, any>>({})

onMounted(async () => {
  loading.value = true
  try {
    experiment.value = await getExperiment(expId)
    experiment.value.params.forEach(p => {
      formData[p.name] = p.default
    })
  } catch (err) {
    ElMessage.error('加载实验配置失败')
  } finally {
    loading.value = false
  }
})

function goBack() {
  router.push('/experiments')
}

function resetForm() {
  experiment.value?.params.forEach(p => {
    formData[p.name] = p.default
  })
}

async function submitRun() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    try {
      const payload: Record<string, any> = {}
      experiment.value?.params.forEach(p => {
        let v = formData[p.name]
        if (p.type === 'int') {
          payload[p.name] = Math.round(Number(v))
        } else if (p.type === 'float') {
          payload[p.name] = Number(v)
        } else if (p.type === 'bool') {
          payload[p.name] = !!v
        } else {
          payload[p.name] = String(v ?? '')
        }
      })
      
      const task = await experimentStore.runExperiment(expId, payload)
      ElMessage.success(`实验已启动，任务ID: ${task.id}`)
      router.push(`/tasks/${task.id}/results`)
    } catch (err) {
      ElMessage.error('启动实验失败')
    }
  })
}
</script>

<style scoped>
.config-page {
  max-width: 960px;
}
.config-card {
  margin-top: 20px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}
.desc {
  color: #64748b;
  margin: 0 0 20px 0;
  font-size: 14px;
}
.config-form {
  margin-top: 10px;
}
.param-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #94a3b8;
}
.param-hint code {
  background: #f1f5f9;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: monospace;
}
</style>

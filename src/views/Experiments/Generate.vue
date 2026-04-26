<template>
  <div class="generate-page">
    <el-page-header @back="goBack" title="返回实验列表" />
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>AI实验生成</span>
              <el-button type="primary" @click="showConfigDialog = true">
                <el-icon><Setting /></el-icon>
                AI配置
              </el-button>
            </div>
          </template>
          
          <el-form :model="form" label-width="100px">
            <el-form-item label="实验名称" required>
              <el-input v-model="form.name" placeholder="例如：实验九：拜占庭容错测试" />
            </el-form-item>
            
            <el-form-item label="实验描述" required>
              <el-input v-model="form.description" type="textarea" :rows="3" placeholder="描述实验的目的和内容" />
            </el-form-item>
            
            <el-form-item label="实验类型" required>
              <el-select v-model="form.type" placeholder="选择实验类型">
                <el-option label="共识算法" value="consensus" />
                <el-option label="存储性能" value="storage" />
                <el-option label="网络测试" value="network" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="实验参数">
              <el-input v-model="paramsInput" type="textarea" :rows="3" placeholder="每行一个参数，例如：&#10;FAULT_TOLERANCE&#10;CONSENSUS_ROUNDS&#10;TIMEOUT_MS" />
              <div class="form-tip">每行一个参数名称，不包含类型和默认值</div>
            </el-form-item>
            
            <el-form-item label="实验目标" required>
              <el-input v-model="form.objectives" type="textarea" :rows="4" placeholder="描述实验要测试的指标和目标，例如：&#10;测试在不同故障节点数量下的共识达成时间&#10;测量TPS和延迟变化" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" :loading="isGenerating" @click="handleGenerate">
                <el-icon><MagicStick /></el-icon>
                生成实验
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>生成结果</span>
          </template>
          
          <div v-if="generatedExp" class="result-preview">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="实验ID">{{ generatedExp.id }}</el-descriptions-item>
              <el-descriptions-item label="实验名称">{{ generatedExp.name }}</el-descriptions-item>
              <el-descriptions-item label="类型">{{ generatedExp.type }}</el-descriptions-item>
            </el-descriptions>
            
            <div class="params-section">
              <h4>实验参数</h4>
              <el-table :data="generatedExp.params" size="small" border>
                <el-table-column prop="name" label="参数名" width="150" />
                <el-table-column prop="type" label="类型" width="80" />
                <el-table-column prop="description" label="说明" />
              </el-table>
            </div>
            
            <div class="metrics-section">
              <h4>指标定义</h4>
              <el-table :data="generatedExp.metrics" size="small" border>
                <el-table-column prop="name" label="指标名" width="120" />
                <el-table-column prop="description" label="说明" />
                <el-table-column prop="unit" label="单位" width="80" />
              </el-table>
            </div>
            
            <div class="actions">
              <el-button type="success" @click="handleRegister">
                <el-icon><Check /></el-icon>
                注册到实验列表
              </el-button>
            </div>
          </div>
          
          <el-empty v-else description="尚未生成实验" />
        </el-card>
      </el-col>
    </el-row>

    <!-- AI Config Dialog -->
    <el-dialog v-model="showConfigDialog" title="AI API配置" width="500px">
      <el-form :model="aiConfig" label-width="100px">
        <el-form-item label="API地址">
          <el-input v-model="aiConfig.api_url" placeholder="https://api.openai.com/v1/chat/completions" />
        </el-form-item>
        <el-form-item label="API密钥">
          <el-input v-model="aiConfig.api_key" type="password" show-password placeholder="sk-..." />
        </el-form-item>
        <el-form-item label="模型">
          <el-input v-model="aiConfig.model" placeholder="gpt-4" />
        </el-form-item>
        <el-form-item label="超时(秒)">
          <el-input-number v-model="aiConfig.timeout" :min="30" :max="600" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showConfigDialog = false">取消</el-button>
        <el-button type="warning" :loading="isTesting" @click="handleTestConfig">
          <el-icon><Connection /></el-icon>
          测试
        </el-button>
        <el-button type="primary" @click="handleSaveConfig">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, MagicStick, Check, Connection } from '@element-plus/icons-vue'
import { getAIConfig, updateAIConfig, testAIConfig, generateExperiment } from '@/api/experiment'
import type { AIConfig, ExperimentRequest, GeneratedExperiment } from '@/api/experiment'

const router = useRouter()

const form = ref<ExperimentRequest>({
  name: '',
  description: '',
  type: 'consensus',
  params: [],
  objectives: ''
})

const paramsInput = ref('')

const aiConfig = ref<AIConfig>({
  api_url: 'https://api.openai.com/v1/chat/completions',
  api_key: '',
  model: 'gpt-4',
  timeout: 120
})

const generatedExp = ref<GeneratedExperiment | null>(null)
const isGenerating = ref(false)
const isTesting = ref(false)
const showConfigDialog = ref(false)

onMounted(async () => {
  try {
    const config = await getAIConfig()
    aiConfig.value = config
  } catch (e) {
    // Use default config
  }
})

const handleGenerate = async () => {
  if (!form.value.name || !form.value.description || !form.value.objectives) {
    ElMessage.warning('请填写必填项')
    return
  }

  form.value.params = paramsInput.value.split('\n').filter(p => p.trim())
  
  isGenerating.value = true
  try {
    generatedExp.value = await generateExperiment(form.value)
    ElMessage.success('实验生成成功')
  } catch (e: any) {
    ElMessage.error('生成失败: ' + (e.message || '未知错误'))
  } finally {
    isGenerating.value = false
  }
}

const handleRegister = () => {
  ElMessage.info('实验注册功能待实现（需要后端支持动态注册）')
}

const handleTestConfig = async () => {
  if (!aiConfig.value.api_url || !aiConfig.value.api_key) {
    ElMessage.warning('请填写API地址和密钥')
    return
  }

  isTesting.value = true
  try {
    await testAIConfig(aiConfig.value)
    ElMessage.success('AI API连接测试成功！')
  } catch (e: any) {
    ElMessage.error('连接测试失败: ' + (e.message || '未知错误'))
  } finally {
    isTesting.value = false
  }
}

const handleSaveConfig = async () => {
  try {
    await updateAIConfig(aiConfig.value)
    showConfigDialog.value = false
    ElMessage.success('配置保存成功')
  } catch (e: any) {
    ElMessage.error('保存失败: ' + (e.message || '未知错误'))
  }
}

function goBack() {
  router.push('/experiments')
}
</script>

<style scoped>
.generate-page { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.form-tip { color: #999; font-size: 12px; margin-top: 4px; }
.result-preview { padding: 10px 0; }
.params-section, .metrics-section { margin-top: 20px; }
.params-section h4, .metrics-section h4 { margin-bottom: 10px; color: #333; }
.actions { margin-top: 20px; display: flex; justify-content: center; }
</style>

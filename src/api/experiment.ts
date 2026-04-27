import axiosInstance from './axiosInstance'
import type { Experiment, Task, ApiResponse } from '@/types'

export interface AIConfig {
  api_url: string
  api_key: string
  model: string
  timeout: number
}

export interface ExperimentRequest {
  name: string
  description: string
  type: string
  params: string[]
  objectives: string
}

export interface GeneratedExperiment {
  id: string
  name: string
  description: string
  type: string
  params: Array<{
    name: string
    type: string
    default: any
    description: string
    required: boolean
  }>
  common_params: Record<string, any>
  metrics: Array<{
    name: string
    description: string
    unit: string
  }>
  scripts: {
    run_script: string
    test_script: string
    python_script: string
  }
}

export function getAIConfig() {
  return axiosInstance.get<ApiResponse<AIConfig>>('/api/ai/config').then(r => r.data.data)
}

export function updateAIConfig(config: AIConfig) {
  return axiosInstance.put<ApiResponse<AIConfig>>('/api/ai/config', config).then(r => r.data.data)
}

export function testAIConfig(config: AIConfig) {
  return axiosInstance.post<ApiResponse<{status: string, message: string}>>('/api/ai/test', config).then(r => r.data.data)
}

export function generateExperiment(req: ExperimentRequest) {
  return axiosInstance.post<ApiResponse<GeneratedExperiment>>('/api/ai/generate', req).then(r => r.data.data)
}

export function getExperiments() {
  return axiosInstance.get<ApiResponse<Experiment[]>>('/api/experiments').then(r => r.data.data)
}

export function getExperiment(id: string) {
  return axiosInstance.get<ApiResponse<Experiment>>(`/api/experiments/${id}`).then(r => r.data.data)
}

export function runExperiment(id: string, params: Record<string, any>) {
  return axiosInstance.post<ApiResponse<Task>>(`/api/experiments/${id}/run`, params).then(r => r.data.data)
}

export function getTasks(expId?: string) {
  const query = expId ? `?exp_id=${encodeURIComponent(expId)}` : ''
  return axiosInstance.get<ApiResponse<Task[]>>(`/api/tasks${query}`).then(r => r.data.data)
}

export function getTask(id: string) {
  return axiosInstance.get<ApiResponse<Task>>(`/api/tasks/${id}`).then(r => r.data.data)
}

export function deleteTask(id: string) {
  return axiosInstance.post(`/api/tasks/${id}/delete`).then(r => r.data.data)
}

export function getResultFileUrl(taskId: string, filePath: string) {
  return `/api/tasks/${taskId}/results/${encodeURIComponent(filePath)}`
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
export const API_TIMEOUT = 30000
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:9090/ws'

export const endpoints = {
  HEALTH: '/api/health',
  EXPERIMENTS: '/api/experiments',
  EXPERIMENT_DETAIL: (id: string) => `/api/experiments/${id}`,
  EXPERIMENT_RUN: (id: string) => `/api/experiments/${id}/run`,
  TASKS: '/api/tasks',
  TASK_DETAIL: (id: string) => `/api/tasks/${id}`,
  TASK_DELETE: (id: string) => `/api/tasks/${id}/delete`,
  TASK_RESULTS: (id: string, file: string) => `/api/tasks/${id}/results/${file}`
}

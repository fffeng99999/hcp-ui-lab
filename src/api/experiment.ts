import http from './http'
import { endpoints } from './config'
import type { Experiment, Task } from '@/types'

export async function getExperiments(): Promise<Experiment[]> {
  return http.get<Experiment[]>(endpoints.EXPERIMENTS)
}

export async function getExperiment(id: string): Promise<Experiment> {
  return http.get<Experiment>(endpoints.EXPERIMENT_DETAIL(id))
}

export async function runExperiment(id: string, params: Record<string, any>): Promise<Task> {
  return http.post<Task>(endpoints.EXPERIMENT_RUN(id), params)
}

export async function getTasks(expId?: string): Promise<Task[]> {
  const url = expId ? `${endpoints.TASKS}?exp_id=${expId}` : endpoints.TASKS
  return http.get<Task[]>(url)
}

export async function getTask(id: string): Promise<Task> {
  return http.get<Task>(endpoints.TASK_DETAIL(id))
}

export async function deleteTask(id: string): Promise<{ deleted: boolean }> {
  return http.post<{ deleted: boolean }>(endpoints.TASK_DELETE(id))
}

export function getResultFileUrl(taskId: string, file: string): string {
  return endpoints.TASK_RESULTS(taskId, file)
}

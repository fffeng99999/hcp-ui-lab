import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as experimentAPI from '@/api/experiment'
import type { Experiment, Task } from '@/types'

export const useExperimentStore = defineStore('experiment', () => {
  const experiments = ref<Experiment[]>([])
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const runningTasks = computed(() => tasks.value.filter(t => t.status === 'running'))
  const completedTasks = computed(() => tasks.value.filter(t => t.status === 'completed'))

  async function loadExperiments() {
    try {
      isLoading.value = true
      error.value = null
      experiments.value = await experimentAPI.getExperiments()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载实验列表失败'
    } finally {
      isLoading.value = false
    }
  }

  async function loadTasks(expId?: string) {
    try {
      isLoading.value = true
      error.value = null
      tasks.value = await experimentAPI.getTasks(expId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载任务列表失败'
    } finally {
      isLoading.value = false
    }
  }

  async function runExperiment(id: string, params: Record<string, any>) {
    try {
      isLoading.value = true
      error.value = null
      const task = await experimentAPI.runExperiment(id, params)
      tasks.value.unshift(task)
      currentTask.value = task
      return task
    } catch (err) {
      error.value = err instanceof Error ? err.message : '启动实验失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function removeTask(id: string) {
    try {
      await experimentAPI.deleteTask(id)
      tasks.value = tasks.value.filter(t => t.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除任务失败'
      throw err
    }
  }

  function updateTaskFromWS(task: Task) {
    const idx = tasks.value.findIndex(t => t.id === task.id)
    if (idx >= 0) {
      tasks.value[idx] = { ...tasks.value[idx], ...task }
    } else {
      tasks.value.unshift(task)
    }
  }

  return {
    experiments,
    tasks,
    currentTask,
    isLoading,
    error,
    runningTasks,
    completedTasks,
    loadExperiments,
    loadTasks,
    runExperiment,
    removeTask,
    updateTaskFromWS
  }
})

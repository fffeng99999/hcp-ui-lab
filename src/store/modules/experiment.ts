import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as experimentAPI from '@/api/experiment'
import type { Experiment, Task } from '@/types'

export const useExperimentStore = defineStore('experiment', () => {
  const experiments = ref<Experiment[]>([])
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const loadingStates = ref({
    experiments: false,
    tasks: false,
    runExperiment: false
  })
  const errors = ref({
    experiments: null as string | null,
    tasks: null as string | null,
    runExperiment: null as string | null
  })

  const isLoading = computed(() => 
    loadingStates.value.experiments || loadingStates.value.tasks || loadingStates.value.runExperiment
  )
  const error = computed(() => 
    errors.value.experiments || errors.value.tasks || errors.value.runExperiment
  )
  const runningTasks = computed(() => tasks.value.filter(t => t.status === 'running'))
  const completedTasks = computed(() => tasks.value.filter(t => t.status === 'completed'))

  async function loadExperiments() {
    try {
      loadingStates.value.experiments = true
      errors.value.experiments = null
      experiments.value = await experimentAPI.getExperiments()
    } catch (err) {
      errors.value.experiments = err instanceof Error ? err.message : '加载实验列表失败'
    } finally {
      loadingStates.value.experiments = false
    }
  }

  async function loadTasks(expId?: string) {
    try {
      loadingStates.value.tasks = true
      errors.value.tasks = null
      tasks.value = await experimentAPI.getTasks(expId)
    } catch (err) {
      errors.value.tasks = err instanceof Error ? err.message : '加载任务列表失败'
    } finally {
      loadingStates.value.tasks = false
    }
  }

  async function runExperiment(id: string, params: Record<string, any>) {
    try {
      loadingStates.value.runExperiment = true
      errors.value.runExperiment = null
      const task = await experimentAPI.runExperiment(id, params)
      tasks.value.unshift(task)
      currentTask.value = task
      return task
    } catch (err) {
      errors.value.runExperiment = err instanceof Error ? err.message : '启动实验失败'
      throw err
    } finally {
      loadingStates.value.runExperiment = false
    }
  }

  async function removeTask(id: string) {
    try {
      await experimentAPI.deleteTask(id)
      tasks.value = tasks.value.filter(t => t.id !== id)
    } catch (err) {
      errors.value.tasks = err instanceof Error ? err.message : '删除任务失败'
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

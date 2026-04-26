export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}

export type ParamType = 'int' | 'float' | 'string' | 'bool' | 'list_int' | 'list_string'

export interface ParamSchema {
  name: string
  type: ParamType
  default: any
  description: string
  required: boolean
}

export interface Experiment {
  id: string
  name: string
  description: string
  run_script: string
  report_dir: string
  params: ParamSchema[]
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface Task {
  id: string
  exp_id: string
  exp_name: string
  status: TaskStatus
  params: Record<string, any>
  output_dir: string
  result_files: string[]
  metrics?: Record<string, any>
  error_msg?: string
  created_at: string
  started_at?: string
  finished_at?: string
  progress: number
}

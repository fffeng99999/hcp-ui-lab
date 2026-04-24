import type { AxiosRequestConfig } from 'axios'
import axiosInstance from './axiosInstance'
import type { ApiResponse } from '@/types'

class HttpClient {
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const resp = await axiosInstance.get<any, ApiResponse<T>>(url, config)
    const apiResp = resp as unknown as ApiResponse<T>
    if (apiResp.code !== 0) {
      throw new Error(apiResp.message || 'Unknown error')
    }
    return apiResp.data as T
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const resp = await axiosInstance.post<any, ApiResponse<T>>(url, data, config)
    const apiResp = resp as unknown as ApiResponse<T>
    if (apiResp.code !== 0) {
      throw new Error(apiResp.message || 'Unknown error')
    }
    return apiResp.data as T
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const resp = await axiosInstance.delete<any, ApiResponse<T>>(url, config)
    const apiResp = resp as unknown as ApiResponse<T>
    if (apiResp.code !== 0) {
      throw new Error(apiResp.message || 'Unknown error')
    }
    return apiResp.data as T
  }
}

export default new HttpClient()

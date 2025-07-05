import axios from 'axios'
import { getCookie, deleteCookie } from '@/util/cookie'

// API 基础配置
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL!,
  timeout: 10000,
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等认证信息
    const token = getCookie(process.env.NEXT_PUBLIC_COOKIE_NAME || 'token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    if (response.data.code === 0) {
      return response.data;
    } else {
      // alert
      return Promise.reject(response.data)
    }
  },
  (error) => {
    // 统一错误处理
    if (error.response?.status === 401) {
      deleteCookie('token')
    }
    return Promise.reject(error)
  }
)

export default api;

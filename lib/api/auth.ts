import axios from 'axios'

// API 基础配置
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等认证信息
    const token = localStorage.getItem('token')
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
    return response.data
  },
  (error) => {
    // 统一错误处理
    if (error.response?.status === 401) {
      // 未授权，清除 token 并跳转到登录页
      localStorage.removeItem('token')
      window.location.href = '/user/login'
    }
    return Promise.reject(error)
  }
)

// 类型定义
export interface LoginAccountRequest {
  username: string
  password: string
}

export interface LoginPhoneRequest {
  phone: string
  code: string
}

export interface RegisterAccountRequest {
  username: string
  email: string
  password: string
}

export interface RegisterPhoneRequest {
  phone: string
  code: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    username: string
    email?: string
    phone?: string
  }
}

// API 函数
export const authAPI = {
  // 账号密码登录
  loginWithAccount: async (data: LoginAccountRequest): Promise<AuthResponse> => {
    return api.post('/auth/login/account', data)
  },

  // 手机号验证码登录
  loginWithPhone: async (data: LoginPhoneRequest): Promise<AuthResponse> => {
    return api.post('/auth/login/phone', data)
  },

  // 账号密码注册
  registerWithAccount: async (data: RegisterAccountRequest): Promise<AuthResponse> => {
    return api.post('/auth/register/account', data)
  },

  // 手机号验证码注册
  registerWithPhone: async (data: RegisterPhoneRequest): Promise<AuthResponse> => {
    return api.post('/auth/register/phone', data)
  },

  // 发送验证码
  sendVerificationCode: async (phone: string): Promise<void> => {
    return api.post('/auth/send-code', { phone })
  },

  // 退出登录
  logout: async (): Promise<void> => {
    return api.post('/auth/logout')
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    return api.get('/auth/me')
  },
}

export default authAPI

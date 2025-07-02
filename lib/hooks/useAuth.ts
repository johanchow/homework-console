import { useState, useEffect, useCallback } from 'react'
import { authAPI } from '@/lib/api/auth'

export interface User {
  id: string
  username: string
  email?: string
  phone?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // 初始化认证状态
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')

        if (token && userStr) {
          const user = JSON.parse(userStr)
          setAuthState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error)
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    initializeAuth()
  }, [])

  // 登录
  const login = useCallback(async (loginData: any, type: 'account' | 'phone') => {
    try {
      const response = type === 'account'
        ? await authAPI.loginWithAccount(loginData)
        : await authAPI.loginWithPhone(loginData)

      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      setAuthState({
        user: response.user,
        token: response.token,
        isLoading: false,
        isAuthenticated: true,
      })

      return response
    } catch (error) {
      throw error
    }
  }, [])

  // 注册
  const register = useCallback(async (registerData: any, type: 'account' | 'phone') => {
    try {
      const response = type === 'account'
        ? await authAPI.registerWithAccount(registerData)
        : await authAPI.registerWithPhone(registerData)

      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      setAuthState({
        user: response.user,
        token: response.token,
        isLoading: false,
        isAuthenticated: true,
      })

      return response
    } catch (error) {
      throw error
    }
  }, [])

  // 退出登录
  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

  // 更新用户信息
  const updateUser = useCallback((user: User) => {
    localStorage.setItem('user', JSON.stringify(user))
    setAuthState(prev => ({
      ...prev,
      user,
    }))
  }, [])

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
  }
}

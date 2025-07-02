'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Phone, Lock, User } from 'lucide-react'

import { Button } from '@/component/button'
import { Input } from '@/component/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/component/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/component/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/component/opt-input'
import { authAPI } from '@/lib/api/auth'

// 账号密码登录表单验证
const accountLoginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(6, '密码至少6位'),
})

// 手机号验证码登录表单验证
const phoneLoginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  code: z.string().length(6, '请输入6位验证码'),
})

type AccountLoginForm = z.infer<typeof accountLoginSchema>
type PhoneLoginForm = z.infer<typeof phoneLoginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')

  // 账号密码登录表单
  const accountForm = useForm<AccountLoginForm>({
    resolver: zodResolver(accountLoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  // 手机号验证码登录表单
  const phoneForm = useForm<PhoneLoginForm>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      phone: '',
      code: '',
    },
  })

  // 账号密码登录
  const onAccountLogin = async (data: AccountLoginForm) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await authAPI.loginWithAccount(data)
      // 保存 token 和用户信息
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      // 登录成功，跳转到首页或指定页面
      router.push('/')
    } catch (error: any) {
      console.error('登录失败:', error)
      setError(error.response?.data?.message || '登录失败，请检查用户名和密码')
    } finally {
      setIsLoading(false)
    }
  }

  // 手机号验证码登录
  const onPhoneLogin = async (data: PhoneLoginForm) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await authAPI.loginWithPhone(data)
      // 保存 token 和用户信息
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      // 登录成功，跳转到首页或指定页面
      router.push('/')
    } catch (error: any) {
      console.error('登录失败:', error)
      setError(error.response?.data?.message || '登录失败，请检查手机号和验证码')
    } finally {
      setIsLoading(false)
    }
  }

  // 发送验证码
  const sendCode = async () => {
    const phone = phoneForm.getValues('phone')
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      phoneForm.setError('phone', { message: '请输入正确的手机号' })
      return
    }

    try {
      await authAPI.sendVerificationCode(phone)

      // 开始倒计时
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      console.error('发送验证码失败:', error)
      setError(error.response?.data?.message || '发送验证码失败，请稍后重试')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">登录</CardTitle>
          <CardDescription className="text-center">
            欢迎回来，请选择登录方式
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">账号密码</TabsTrigger>
              <TabsTrigger value="phone">手机验证码</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-4">
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(onAccountLogin)} className="space-y-4">
                  <FormField
                    control={accountForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>用户名</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              {...field}
                              placeholder="请输入用户名"
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={accountForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>密码</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              {...field}
                              type={showPassword ? 'text' : 'password'}
                              placeholder="请输入密码"
                              className="pl-10 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? '登录中...' : '登录'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
              <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit(onPhoneLogin)} className="space-y-4">
                  <FormField
                    control={phoneForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>手机号</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              {...field}
                              placeholder="请输入手机号"
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={phoneForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>验证码</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <InputOTP
                              value={field.value}
                              onChange={field.onChange}
                              maxLength={6}
                              render={({ slots }) => (
                                <InputOTPGroup>
                                  {slots.map((slot, index) => (
                                    <InputOTPSlot key={index} index={index} {...slot} />
                                  ))}
                                </InputOTPGroup>
                              )}
                            />
                            <div className="flex justify-between items-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={sendCode}
                                disabled={countdown > 0}
                              >
                                {countdown > 0 ? `${countdown}s后重发` : '发送验证码'}
                              </Button>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? '登录中...' : '登录'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              还没有账号？{' '}
              <Link href="/user/register" className="text-blue-600 hover:text-blue-500">
                立即注册
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

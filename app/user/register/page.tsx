'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Phone, Lock, User, CheckCircle } from 'lucide-react'

import { Button } from '@/component/button'
import { Input } from '@/component/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/component/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/component/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/component/opt-input'
import { Checkbox } from '@/component/checkbox'
import { authAPI } from '@/lib/api/auth'

// 账号密码注册表单验证
const accountRegisterSchema = z.object({
  username: z.string().min(3, '用户名至少3位').max(20, '用户名最多20位'),
  email: z.string().email('请输入正确的邮箱地址'),
  password: z.string().min(6, '密码至少6位').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine(val => val === true, '请同意用户协议和隐私政策'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

// 手机号验证码注册表单验证
const phoneRegisterSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  code: z.string().length(6, '请输入6位验证码'),
  agreeTerms: z.boolean().refine(val => val === true, '请同意用户协议和隐私政策'),
})

type AccountRegisterForm = z.infer<typeof accountRegisterSchema>
type PhoneRegisterForm = z.infer<typeof phoneRegisterSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')

  // 账号密码注册表单
  const accountForm = useForm<AccountRegisterForm>({
    resolver: zodResolver(accountRegisterSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  })

  // 手机号验证码注册表单
  const phoneForm = useForm<PhoneRegisterForm>({
    resolver: zodResolver(phoneRegisterSchema),
    defaultValues: {
      phone: '',
      code: '',
      agreeTerms: false,
    },
  })

  // 账号密码注册
  const onAccountRegister = async (data: AccountRegisterForm) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await authAPI.registerWithAccount({
        username: data.username,
        email: data.email,
        password: data.password,
      })
      // 保存 token 和用户信息
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      // 注册成功，跳转到首页或指定页面
      router.push('/')
    } catch (error: any) {
      console.error('注册失败:', error)
      setError(error.response?.data?.message || '注册失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 手机号验证码注册
  const onPhoneRegister = async (data: PhoneRegisterForm) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await authAPI.registerWithPhone({
        phone: data.phone,
        code: data.code,
      })
      // 保存 token 和用户信息
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      // 注册成功，跳转到首页或指定页面
      router.push('/')
    } catch (error: any) {
      console.error('注册失败:', error)
      setError(error.response?.data?.message || '注册失败，请检查手机号和验证码')
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
          <CardTitle className="text-2xl text-center">注册</CardTitle>
          <CardDescription className="text-center">
            创建您的账户，开始使用我们的服务
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
                <form onSubmit={accountForm.handleSubmit(onAccountRegister)} className="space-y-4">
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮箱</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="请输入邮箱地址"
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

                  <FormField
                    control={accountForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>确认密码</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              {...field}
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="请再次输入密码"
                              className="pl-10 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={accountForm.control}
                    name="agreeTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            我已阅读并同意{' '}
                            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                              用户协议
                            </Link>
                            {' '}和{' '}
                            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                              隐私政策
                            </Link>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? '注册中...' : '注册'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
              <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit(onPhoneRegister)} className="space-y-4">
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

                  <FormField
                    control={phoneForm.control}
                    name="agreeTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            我已阅读并同意{' '}
                            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                              用户协议
                            </Link>
                            {' '}和{' '}
                            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                              隐私政策
                            </Link>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? '注册中...' : '注册'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              已有账号？{' '}
              <Link href="/user/login" className="text-blue-600 hover:text-blue-500">
                立即登录
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

/**
 * LoginRegisterModal 组件
 *
 * 功能：
 * - 支持账号密码登录/注册
 * - 支持手机验证码登录/注册
 * - 表单验证（使用 zod）
 * - 验证码发送倒计时
 * - 密码显示/隐藏切换
 * - 错误提示
 *
 * 使用示例：
 * ```tsx
 * import { LoginRegisterModal } from '@/feature/LoginRegisterModal'
 * import { Button } from '@/component/button'
 *
 * function MyComponent() {
 *   const handleSuccess = () => {
 *     console.log('登录/注册成功')
 *     // 可以在这里添加成功后的逻辑
 *   }
 *
 *   return (
 *     <LoginRegisterModal onSuccess={handleSuccess}>
 *       <Button>登录/注册</Button>
 *     </LoginRegisterModal>
 *   )
 * }
 * ```
 */

import * as React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Phone, Lock, User, CheckCircle } from 'lucide-react'
import { setCookie } from '@/util/cookie'
import { Button } from '@/component/button'
import { Input } from '@/component/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/component/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/component/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/component/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/component/opt-input'
import { Checkbox } from '@/component/checkbox'
import { login, register, logout, sendVerificationCode } from '@/api/axios/user'

// 账号密码登录表单验证
const accountLoginSchema = z.object({
  mode: z.literal('name'),
  name: z.string().min(1, '请输入用户名'),
  password: z.string().min(6, '密码至少6位'),
})

// 手机号验证码登录表单验证
const phoneLoginSchema = z.object({
  mode: z.literal('phone'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  verify_code: z.string().length(6, '请输入6位验证码'),
})

// 账号密码注册表单验证
const accountRegisterSchema = z.object({
  mode: z.literal('name'),
  name: z.string().min(3, '用户名至少3位').max(20, '用户名最多20位'),
  password: z.string().min(6, '密码至少6位').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine(val => val === true, '请同意用户协议和隐私政策'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

// 手机号验证码注册表单验证
const phoneRegisterSchema = z.object({
  mode: z.literal('phone'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  verify_code: z.string().length(6, '请输入6位验证码'),
  agreeTerms: z.boolean().refine(val => val === true, '请同意用户协议和隐私政策'),
})

type AccountLoginForm = z.infer<typeof accountLoginSchema>
type PhoneLoginForm = z.infer<typeof phoneLoginSchema>
type AccountRegisterForm = z.infer<typeof accountRegisterSchema>
type PhoneRegisterForm = z.infer<typeof phoneRegisterSchema>

interface LoginRegisterModalProps {
  children: React.ReactNode
  onSuccess?: () => void
}

export function LoginRegisterModal({ children, onSuccess }: LoginRegisterModalProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')

  // 账号密码登录表单
  const accountLoginForm = useForm<AccountLoginForm>({
    resolver: zodResolver(accountLoginSchema),
    defaultValues: {
      mode: 'name',
      name: '',
      password: '',
    },
  })

  // 手机号验证码登录表单
  const phoneLoginForm = useForm<PhoneLoginForm>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      mode: 'phone',
      phone: '',
      verify_code: '',
    },
  })

  // 账号密码注册表单
  const accountRegisterForm = useForm<AccountRegisterForm>({
    resolver: zodResolver(accountRegisterSchema),
    defaultValues: {
      mode: 'name',
      name: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  })

  // 手机号验证码注册表单
  const phoneRegisterForm = useForm<PhoneRegisterForm>({
    resolver: zodResolver(phoneRegisterSchema),
    defaultValues: {
      mode: 'phone',
      phone: '',
      verify_code: '',
      agreeTerms: false,
    },
  })

  // 账号密码登录
  const onAccountLogin = async (data: AccountLoginForm) => {
    setIsLoading(true)
    setError('')
    try {
      const respData = await login(data)
      setCookie(process.env.NEXT_PUBLIC_TOKEN_COOKIE_NAME!, respData.token)
      setCookie(process.env.NEXT_PUBLIC_USERID_COOKIE_NAME!, respData.user.id)
      setOpen(false)
      onSuccess?.()
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
      const response = await login(data)
      setCookie('token', response.token)
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('登录失败:', error)
      setError(error.response?.data?.message || '登录失败，请检查手机号和验证码')
    } finally {
      setIsLoading(false)
    }
  }

  // 账号密码注册
  const onAccountRegister = async (data: AccountRegisterForm) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await register({
        mode: 'name',
        name: data.name,
        password: data.password,
      })
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      setOpen(false)
      onSuccess?.()
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
      const response = await register({
        mode: 'phone',
        phone: data.phone,
        verify_code: data.verify_code,
      })
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('注册失败:', error)
      setError(error.response?.data?.message || '注册失败，请检查手机号和验证码')
    } finally {
      setIsLoading(false)
    }
  }

  // 发送验证码
  const sendCode = async (form: any, fieldName: 'phone') => {
    const phone = form.getValues(fieldName)
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      form.setError(fieldName, { message: '请输入正确的手机号' })
      return
    }

    try {
      await sendVerificationCode(phone)
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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setError('')
      setCountdown(0)
      // 重置所有表单
      accountLoginForm.reset()
      phoneLoginForm.reset()
      accountRegisterForm.reset()
      phoneRegisterForm.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? '登录' : '注册'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login' ? '欢迎回来，请选择登录方式' : '创建您的账户，开始使用我们的服务'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">账号密码</TabsTrigger>
            <TabsTrigger value="phone">手机验证码</TabsTrigger>
          </TabsList>

          {/* 登录模式 */}
          {mode === 'login' && (
            <>
              <TabsContent value="account" className="space-y-4">
                <Form {...accountLoginForm}>
                  <form onSubmit={accountLoginForm.handleSubmit(onAccountLogin)} className="space-y-4">
                    <FormField
                      control={accountLoginForm.control}
                      name="name"
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
                      control={accountLoginForm.control}
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
                <Form {...phoneLoginForm}>
                  <form onSubmit={phoneLoginForm.handleSubmit(onPhoneLogin)} className="space-y-4">
                    <FormField
                      control={phoneLoginForm.control}
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
                      control={phoneLoginForm.control}
                      name="verify_code"
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
                                      <InputOTPSlot key={index} index={index} />
                                    ))}
                                  </InputOTPGroup>
                                )}
                              />
                              <div className="flex justify-between items-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => sendCode(phoneLoginForm, 'phone')}
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
            </>
          )}

          {/* 注册模式 */}
          {mode === 'register' && (
            <>
              <TabsContent value="account" className="space-y-4">
                <Form {...accountRegisterForm}>
                  <form onSubmit={accountRegisterForm.handleSubmit(onAccountRegister)} className="space-y-4">
                    <FormField
                      control={accountRegisterForm.control}
                      name="name"
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
                      control={accountRegisterForm.control}
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
                      control={accountRegisterForm.control}
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
                      control={accountRegisterForm.control}
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
                              我已阅读并同意用户协议和隐私政策
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
                <Form {...phoneRegisterForm}>
                  <form onSubmit={phoneRegisterForm.handleSubmit(onPhoneRegister)} className="space-y-4">
                    <FormField
                      control={phoneRegisterForm.control}
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
                      control={phoneRegisterForm.control}
                      name="verify_code"
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
                                      <InputOTPSlot key={index} index={index} />
                                    ))}
                                  </InputOTPGroup>
                                )}
                              />
                              <div className="flex justify-between items-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => sendCode(phoneRegisterForm, 'phone')}
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
                      control={phoneRegisterForm.control}
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
                              我已阅读并同意用户协议和隐私政策
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
            </>
          )}
        </Tabs>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {mode === 'login' ? '还没有账号？' : '已有账号？'}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-blue-600 hover:text-blue-500 ml-1"
            >
              {mode === 'login' ? '立即注册' : '立即登录'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

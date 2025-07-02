# 作业控制台 (Homework Console)

一个现代化的作业管理系统，使用 Next.js 15 和 TypeScript 构建。

## 功能特性

### 用户认证系统
- **双重登录方式**：
  - 账号密码登录
  - 手机号验证码登录
- **双重注册方式**：
  - 账号密码注册（包含邮箱验证）
  - 手机号验证码注册
- **表单验证**：使用 Zod 进行严格的表单验证
- **状态管理**：使用自定义 Hook 管理用户认证状态

### 技术栈
- **前端框架**：Next.js 15 (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS 4
- **表单处理**：React Hook Form + Zod
- **UI 组件**：自定义组件库 (基于 Radix UI)
- **HTTP 客户端**：Axios
- **状态管理**：React Hooks

## 项目结构

```
├── app/
│   └── user/
│       ├── login/          # 登录页面
│       ├── register/       # 注册页面
│       └── profile/        # 用户资料页面
├── component/              # UI 组件库
│   ├── button/
│   ├── input/
│   ├── form/
│   ├── card/
│   ├── tabs/
│   ├── opt-input/         # 验证码输入组件
│   └── ...
├── lib/
│   ├── api/
│   │   └── auth.ts        # 认证相关 API
│   ├── hooks/
│   │   └── useAuth.ts     # 认证状态管理 Hook
│   └── utils.ts           # 工具函数
└── entity/                # 实体定义
```

## 快速开始

### 安装依赖
```bash
pnpm install
```

### 开发环境运行
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
```

## 认证功能使用

### 登录页面
访问 `/user/login` 可以看到登录页面，支持：
- 账号密码登录
- 手机号验证码登录
- 表单验证和错误提示
- 验证码发送倒计时

### 注册页面
访问 `/user/register` 可以看到注册页面，支持：
- 账号密码注册（包含邮箱、密码强度验证）
- 手机号验证码注册
- 用户协议同意
- 表单验证和错误提示

### API 集成
项目已配置好 API 调用结构，包括：
- 统一的错误处理
- 请求/响应拦截器
- Token 自动管理
- 类型安全的 API 调用

## 组件使用示例

### 表单组件
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/component/form'
import { Input } from '@/component/input'
import { Button } from '@/component/button'

const schema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(6, '密码至少6位'),
})

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input {...field} placeholder="请输入用户名" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">登录</Button>
      </form>
    </Form>
  )
}
```

### 验证码输入组件
```tsx
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/component/opt-input'

<InputOTP
  value={code}
  onChange={setCode}
  maxLength={6}
  render={({ slots }) => (
    <InputOTPGroup>
      {slots.map((slot, index) => (
        <InputOTPSlot key={index} index={index} {...slot} />
      ))}
    </InputOTPGroup>
  )}
/>
```

## 环境变量配置

创建 `.env.local` 文件：
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 开发注意事项

1. **类型安全**：项目使用 TypeScript，确保所有组件和函数都有正确的类型定义
2. **表单验证**：使用 Zod 进行表单验证，确保数据完整性
3. **错误处理**：所有 API 调用都有统一的错误处理机制
4. **响应式设计**：使用 Tailwind CSS 确保在不同设备上的良好体验
5. **可访问性**：组件基于 Radix UI，具有良好的可访问性支持

## 后续开发

- [ ] 添加用户资料管理
- [ ] 实现作业管理功能
- [ ] 添加权限控制
- [ ] 集成文件上传
- [ ] 添加实时通知
- [ ] 实现多语言支持 

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { BookOpen, FileText, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const features = [
    {
      title: '作业管理',
      description: '高效管理作业发布、提交和批改',
      icon: BookOpen,
      href: '/homework',
    },
    {
      title: '试卷系统',
      description: '创建和管理在线试卷，支持多种题型',
      icon: FileText,
      href: '/paper',
    },
    {
      title: '考试安排',
      description: '灵活安排考试时间，自动提醒学生',
      icon: TrendingUp,
      href: '/exam',
    },
    {
      title: '用户管理',
      description: '管理学生和教师账户，权限分配',
      icon: Users,
      href: '/users',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 英雄区域 */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              现代化的
              <span className="text-blue-600"> 作业管理系统</span>
            </h1>
            <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
              为教育工作者和学生提供高效、便捷的作业管理解决方案。
              支持多种题型、自动批改、数据分析等功能。
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Button size="lg" asChild>
                <Link href="/user/register">开始使用</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/demo">查看演示</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 功能特性 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">核心功能</h2>
          <p className="mt-4 text-lg text-gray-600">
            全面的作业管理功能，满足现代教育需求
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href={feature.href}>了解更多</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 统计数据 */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">10,000+</div>
              <div className="text-lg text-gray-600 mt-2">活跃用户</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">50,000+</div>
              <div className="text-lg text-gray-600 mt-2">作业提交</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">99.9%</div>
              <div className="text-lg text-gray-600 mt-2">系统可用性</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

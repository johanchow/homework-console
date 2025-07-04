import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Target, Brain, Bot, Eye, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const features = [
    {
      title: '设定学习目标',
      description: '个性化制定学习计划，明确学习方向和进度',
      icon: Target,
      href: '/goal',
      status: 'active'
    },
    {
      title: '智能出题系统',
      description: 'AI根据学习目标自动生成针对性练习题',
      icon: Brain,
      href: '/question',
      status: 'pending'
    },
    {
      title: 'AI智能陪学',
      description: '实时解答疑问，个性化学习指导',
      icon: Bot,
      href: '/ai-tutor',
      status: 'pending'
    },
    {
      title: '远程答卷查看',
      description: '实时查看学习进度，智能分析答题情况',
      icon: Eye,
      href: '/progress',
      status: 'pending'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 英雄区域 */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              智能
              <span className="text-blue-600"> 自主学习系统</span>
            </h1>
            <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
              从设定目标到智能出题，从AI陪学到进度跟踪，打造个性化的自主学习体验。
              让学习更高效，让成长更智能。
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Button size="lg" asChild>
                <Link href="/goal">开始学习</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/demo">体验演示</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 学习流程 - 流水线样式 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">学习流程</h2>
          <p className="mt-4 text-lg text-gray-600">
            四步打造完美自主学习体验
          </p>
        </div>

        {/* 流水线容器 */}
        <div className="relative">
          {/* 连接线 */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200 hidden lg:block"></div>
          
          {/* 步骤列表 */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-4">
            {features.map((feature, index) => (
              <div key={feature.title} className="relative">
                {/* 桌面端连接线 */}
                <div className="hidden lg:block absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-200"></div>
                
                {/* 步骤圆圈 */}
                <div className="relative z-10 flex justify-center mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                    feature.status === 'active' 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {feature.status === 'active' ? (
                      <CheckCircle className="w-8 h-8" />
                    ) : (
                      <feature.icon className="w-8 h-8" />
                    )}
                  </div>
                </div>

                {/* 步骤内容 */}
                <div className="text-center">
                  <div className="mb-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      步骤 {index + 1}
                    </span>
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    feature.status === 'active' ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <Button 
                    variant={feature.status === 'active' ? 'default' : 'outline'} 
                    size="sm" 
                    asChild
                    className="w-full"
                  >
                    <Link href={feature.href}>
                      {feature.status === 'active' ? '立即开始' : '了解详情'}
                    </Link>
                  </Button>
                </div>

                {/* 移动端连接线 */}
                {index < features.length - 1 && (
                  <div className="lg:hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">15,000+</div>
              <div className="text-lg text-gray-600 mt-2">活跃学习者</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">100,000+</div>
              <div className="text-lg text-gray-600 mt-2">智能题目</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">95%</div>
              <div className="text-lg text-gray-600 mt-2">学习效率提升</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

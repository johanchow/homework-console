'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Input } from '@/component/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/select'
import { Badge } from '@/component/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/component/dropdown-menu'
import { Search, Target, Calendar, BookOpen, Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// 模拟数据
const mockGoals = [
  {
    id: 1,
    name: '掌握高等数学微积分',
    subject: '数学',
    updated_at: '2024-01-15T10:30:00Z',
    exam_count: 8,
    description: '深入学习微积分的基本概念和应用'
  },
  {
    id: 2,
    name: '英语四级词汇突破',
    subject: '英语',
    updated_at: '2024-01-14T14:20:00Z',
    exam_count: 12,
    description: '系统学习四级核心词汇和语法'
  },
  {
    id: 3,
    name: '数据结构与算法基础',
    subject: '计算机科学',
    updated_at: '2024-01-13T09:15:00Z',
    exam_count: 15,
    description: '掌握基本数据结构和算法思想'
  },
  {
    id: 4,
    name: '物理力学原理',
    subject: '物理',
    updated_at: '2024-01-12T16:45:00Z',
    exam_count: 6,
    description: '理解力学基本定律和公式'
  },
  {
    id: 5,
    name: '化学有机化学',
    subject: '化学',
    updated_at: '2024-01-11T11:30:00Z',
    exam_count: 10,
    description: '学习有机化学的基本反应机理'
  },
  {
    id: 6,
    name: '历史中国古代史',
    subject: '历史',
    updated_at: '2024-01-10T13:20:00Z',
    exam_count: 7,
    description: '深入了解中国古代历史发展脉络'
  },
  {
    id: 7,
    name: '地理世界地理',
    subject: '地理',
    updated_at: '2024-01-09T15:10:00Z',
    exam_count: 9,
    description: '学习世界各国的地理特征'
  },
  {
    id: 8,
    name: '生物细胞生物学',
    subject: '生物',
    updated_at: '2024-01-08T08:45:00Z',
    exam_count: 11,
    description: '探索细胞的结构和功能'
  },
  {
    id: 9,
    name: '政治马克思主义原理',
    subject: '政治',
    updated_at: '2024-01-07T12:30:00Z',
    exam_count: 5,
    description: '学习马克思主义基本理论'
  },
  {
    id: 10,
    name: '语文现代文阅读',
    subject: '语文',
    updated_at: '2024-01-06T10:15:00Z',
    exam_count: 13,
    description: '提高现代文阅读理解能力'
  },
  {
    id: 11,
    name: '数学线性代数',
    subject: '数学',
    updated_at: '2024-01-05T14:50:00Z',
    exam_count: 8,
    description: '掌握线性代数的基本概念'
  },
  {
    id: 12,
    name: '英语口语训练',
    subject: '英语',
    updated_at: '2024-01-04T16:20:00Z',
    exam_count: 6,
    description: '提升英语口语表达能力'
  },
  {
    id: 13,
    name: '计算机编程基础',
    subject: '计算机科学',
    updated_at: '2024-01-03T09:30:00Z',
    exam_count: 14,
    description: '学习基础编程语言和逻辑'
  },
  {
    id: 14,
    name: '物理电磁学',
    subject: '物理',
    updated_at: '2024-01-02T11:45:00Z',
    exam_count: 7,
    description: '理解电磁学的基本原理'
  }
]

const subjects = ['全部', '数学', '英语', '计算机科学', '物理', '化学', '历史', '地理', '生物', '政治', '语文']

export default function GoalPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('全部')
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const itemsPerPage = 12

  // 过滤数据
  const filteredGoals = useMemo(() => {
    return mockGoals.filter(goal => {
      const matchesSearch = goal.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSubject = selectedSubject === '全部' || goal.subject === selectedSubject
      return matchesSearch && matchesSubject
    })
  }, [searchQuery, selectedSubject])

  // 分页数据
  const paginatedGoals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredGoals.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredGoals, currentPage])

  const totalPages = Math.ceil(filteredGoals.length / itemsPerPage)
  const hasMore = currentPage < totalPages

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1) // 重置到第一页
  }

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value)
    setCurrentPage(1) // 重置到第一页
  }

  const handleDeleteGoal = (goalId: number) => {
    // TODO: 实现删除逻辑
    console.log('删除目标:', goalId)
  }

  return (
    <>
      {/* 过滤和搜索区域 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索输入框 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="搜索学习目标..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 科目筛选 */}
          <div className="w-full sm:w-48">
            <Select value={selectedSubject} onValueChange={handleSubjectChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择科目" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 新建目标按钮 */}
          <Button asChild className="w-full sm:w-auto">
            <Link href="/goal/create">
              <Plus className="w-4 h-4 mr-2" />
              新建目标
            </Link>
          </Button>
        </div>
      </div>

      {/* 结果统计 */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          共找到 <span className="font-semibold text-gray-900">{filteredGoals.length}</span> 个学习目标
        </p>
      </div>

      {/* 目标卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {paginatedGoals.map((goal) => (
          <Card key={goal.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
            router.push(`/goal/${goal.id}`)
          }}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {goal.name}
                  </CardTitle>
                  <CardDescription className="mt-2 line-clamp-2">
                    {goal.description}
                  </CardDescription>
                </div>
                {/* 更多操作下拉菜单 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* 科目标签 */}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {goal.subject}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {goal.exam_count} 个练习
                  </div>
                </div>

                {/* 更新时间 */}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  更新于 {formatDate(goal.updated_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 加载更多按钮 */}
      {hasMore && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={handleLoadMore}
            className="px-8"
          >
            加载更多
          </Button>
        </div>
      )}

      {/* 无结果提示 */}
      {filteredGoals.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无学习目标</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedSubject !== '全部' 
              ? '没有找到匹配的学习目标，请尝试调整搜索条件' 
              : '开始创建您的第一个学习目标吧！'
            }
          </p>
          <Button asChild>
            <Link href="/goal/create">
              <Plus className="w-4 h-4 mr-2" />
              创建学习目标
            </Link>
          </Button>
        </div>
      )}
    </>
  )
}

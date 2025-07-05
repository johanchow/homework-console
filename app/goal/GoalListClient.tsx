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
import { useQuery } from '@tanstack/react-query'
import { listGoals } from '@/api/axios/goal'
import { Goal } from '@/entity/goal'

// 扩展Goal类型以匹配当前UI需求
type GoalWithExamCount = Goal & {
  exam_count: number
  description: string
}

const subjects = ['全部', '数学', '英语', '计算机科学', '物理', '化学', '历史', '地理', '生物', '政治', '语文']

export function GoalListClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('全部')
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const itemsPerPage = 12

  // 使用React Query获取数据
  const { data: goalsData, isLoading, error } = useQuery({
    queryKey: ['goals', { page: currentPage, page_size: itemsPerPage, name: searchQuery }],
    queryFn: () => listGoals({
      name: searchQuery || undefined
    }, {
      page: currentPage,
      page_size: itemsPerPage,
    }),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })

  // 过滤数据
  const filteredGoals = useMemo(() => {
    if (!goalsData?.goals) return []

    return goalsData.goals.filter(goal => {
      const matchesSubject = selectedSubject === '全部' || goal.subject === selectedSubject
      return matchesSubject
    })
  }, [goalsData?.goals, selectedSubject])

  const totalPages = Math.ceil((goalsData?.count || 0) / itemsPerPage)
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

  const handleDeleteGoal = (goalId: string) => {
    // TODO: 实现删除逻辑
    console.log('删除目标:', goalId)
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Target className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
        <p className="text-gray-600 mb-4">无法加载学习目标数据，请稍后重试</p>
        <Button onClick={() => window.location.reload()}>
          重新加载
        </Button>
      </div>
    )
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
        {filteredGoals.map((goal) => (
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
                    {goal.ai_prompt || '暂无描述'}
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
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteGoal(goal.id)
                      }}
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
                    {/* TODO: 从API获取实际的exam_count */}
                    0 个练习
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
            disabled={isLoading}
          >
            {isLoading ? '加载中...' : '加载更多'}
          </Button>
        </div>
      )}

      {/* 无结果提示 */}
      {filteredGoals.length === 0 && !isLoading && (
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
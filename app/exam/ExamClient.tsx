'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Button } from '@/component/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Badge } from '@/component/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/component/table'

import { Edit, Trash2, Plus, Search, Filter, X } from 'lucide-react'
import { listExams, deleteExam } from '@/api/axios/exam'
import { Exam, ExamStatus } from '@/entity/exam'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/component/alert-dialog'
import { useEffect } from 'react'
import Link from 'next/link'

export function ExamClient() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<Record<string, string | undefined>>({})
  const pagination = {
    page: 1,
    page_size: 20,
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['exams', filters, pagination],
    queryFn: () => listExams(filters, pagination),
    staleTime: 2 * 60 * 1000, // 2分钟缓存
  })

  // 当数据更新时同步状态
  useEffect(() => {
    if (data) {
      setExams(data.exams)
      setTotal(data.total)
    }
  }, [data])

  const deleteExamMutation = useMutation({
    mutationFn: (examId: string) => deleteExam(examId),
    onSuccess: (_, examId) => {
      setExams(prev => prev.filter(exam => exam.id !== examId))
      toast.success('考试已删除')
    },
    onError: () => {
      toast.error('删除失败，请重试')
    }
  })

  const handleDeleteExam = (examId: string) => {
    deleteExamMutation.mutate(examId)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
  }

  const getStatusBadge = (status: ExamStatus) => {
    const statusMap = {
      [ExamStatus.PENDING]: { label: '待开始', variant: 'secondary' as const },
      [ExamStatus.PREPARING]: { label: '准备中', variant: 'outline' as const },
      [ExamStatus.COMPLETED]: { label: '已完成', variant: 'default' as const },
      [ExamStatus.FAILED]: { label: '失败', variant: 'destructive' as const }
    }
    return statusMap[status] || { label: '未知', variant: 'secondary' as const }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和创建按钮 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">考试管理</h1>
            <p className="text-gray-600 mt-2">管理和查看所有考试</p>
          </div>
          <Button asChild>
            <Link href="/exam/create">
              <Plus className="w-4 h-4 mr-2" />
              创建考试
            </Link>
          </Button>
        </div>

        {/* 过滤栏 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              筛选条件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">考试标题</label>
                <input
                  type="text"
                  placeholder="搜索考试标题"
                  value={filters.title || ''}
                  onChange={(e) => handleFilterChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">状态</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部状态</option>
                  <option value={ExamStatus.PENDING}>待开始</option>
                  <option value={ExamStatus.PREPARING}>准备中</option>
                  <option value={ExamStatus.COMPLETED}>已完成</option>
                  <option value={ExamStatus.FAILED}>失败</option>
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  清除过滤
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 考试列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>考试列表</span>
              <Badge variant="secondary">{total} 个考试</Badge>
            </CardTitle>
            <CardDescription>
              查看和管理所有考试
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">加载中...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">加载失败，请重试</p>
                <Button onClick={() => window.location.reload()}>
                  重新加载
                </Button>
              </div>
            ) : exams.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>考试标题</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>计划开始时间</TableHead>
                      <TableHead>计划用时</TableHead>
                      <TableHead>题目数量</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => {
                      const statusInfo = getStatusBadge(exam.status)
                      return (
                        <TableRow key={exam.id}>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="font-medium text-gray-900">
                                {exam.title}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {formatDate(exam.plan_starttime)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {formatDuration(exam.plan_duration)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {exam.question_ids?.length || 0} 题
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/exam/${exam.id}`)}
                                className="text-blue-600 hover:text-blue-700"
                                title="编辑考试"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    title="删除考试"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      确定要删除考试 "{exam.title}" 吗？此操作不可撤销。
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteExam(exam.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      删除
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>暂无考试数据</p>
                {(filters.title || filters.status) && (
                  <p className="mt-2">尝试调整搜索条件</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
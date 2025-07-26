'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Input } from '@/component/input'
import { Badge } from '@/component/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/select'
import { Search, Edit, Trash2, Image, Video, Volume2, Plus } from 'lucide-react'
import { listQuestions } from '@/api/axios/question'
import { FilterParams } from '@/api/typing/question'
import { Question, QuestionSubject, questionTypeLabel, questionSubjectLabel } from '@/entity/question'
import { QuestionEditModal } from '@/feature/QuestionEditModal'

export function QuestionClient() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<FilterParams>({})
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['questions', filters, pagination],
    queryFn: () => listQuestions(filters, pagination),
    staleTime: 2 * 60 * 1000, // 2分钟缓存
  })

  // 当数据更新时同步状态
  useEffect(() => {
    if (data) {
      setQuestions(data.questions)
      setTotal(data.total)
    }
  }, [data])

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId))
    toast.success('题目已删除')
  }

  const handleSaveQuestion = (updatedQuestion: Question) => {
    setQuestions(prev =>
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    )
    toast.success('题目已更新')
  }

  const handleFilterChange = (key: keyof FilterParams, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination(prev => ({ ...prev, page: 1 })) // 重置到第一页
  }

  const clearFilters = () => {
    setFilters({})
    setPagination(prev => ({ ...prev, page: 1 }))
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

  const truncateTitle = (title: string, maxLength: number = 50) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title
  }

  const getMediaInfo = (question: Question) => {
    const parts = []
    if (question.images && question.images.length > 0) {
      parts.push(`${question.images.length}个图片`)
    }
    if (question.videos && question.videos.length > 0) {
      parts.push(`${question.videos.length}个视频`)
    }
    if (question.audios && question.audios.length > 0) {
      parts.push(`${question.audios.length}个音频`)
    }
    return parts.join('、') || '-'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和创建按钮 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">题目管理</h1>
            <p className="text-gray-600 mt-2">管理和组织您的题目库</p>
          </div>
          <Button onClick={() => window.open('/question/create', '_blank')}>
            <Plus className="w-4 h-4 mr-2" />
            创建题目
          </Button>
        </div>

        {/* 搜索和过滤 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              {/* 标题搜索 */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索题目标题..."
                  value={filters.title || ''}
                  onChange={(e) => handleFilterChange('title', e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 科目过滤 */}
              <Select value={filters.subject || 'all'} onValueChange={(value) => handleFilterChange('subject', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择科目" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部科目</SelectItem>
                  {Object.entries(questionSubjectLabel).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 类型过滤 */}
              <Select value={filters.type || 'all'} onValueChange={(value) => handleFilterChange('type', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {Object.entries(questionTypeLabel).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 开始时间 */}
              <Input
                type="date"
                placeholder="开始时间"
                value={filters.start_date || ''}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
              />

              {/* 结束时间 */}
              <Input
                type="date"
                placeholder="结束时间"
                value={filters.end_date || ''}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
              />

              {/* 清除过滤 */}
              <Button variant="outline" size="sm" onClick={clearFilters}>
                清除过滤
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 题目列表 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>题目列表</span>
              <Badge variant="secondary">{total} 道题</Badge>
            </CardTitle>
            <CardDescription>
              查看和管理所有题目
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">加载中...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                <p>加载失败，请重试</p>
              </div>
            ) : questions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">题目</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">科目</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">类型</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">媒体</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">更新时间</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((question) => (
                      <tr key={question.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="max-w-xs">
                            <p className="font-medium text-gray-900">
                              {truncateTitle(question.title)}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{questionSubjectLabel[question.subject as QuestionSubject] || question.subject}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary">{questionTypeLabel[question.type]}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            {question.images && question.images.length > 0 && (
                              <div className="flex items-center">
                                <Image className="w-3 h-3 mr-1" />
                                <span>{question.images.length}</span>
                              </div>
                            )}
                            {question.videos && question.videos.length > 0 && (
                              <div className="flex items-center">
                                <Video className="w-3 h-3 mr-1" />
                                <span>{question.videos.length}</span>
                              </div>
                            )}
                            {question.audios && question.audios.length > 0 && (
                              <div className="flex items-center">
                                <Volume2 className="w-3 h-3 mr-1" />
                                <span>{question.audios.length}</span>
                              </div>
                            )}
                            {(!question.images || question.images.length === 0) &&
                              (!question.videos || question.videos.length === 0) &&
                              (!question.audios || question.audios.length === 0) && (
                                <span>-</span>
                              )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatDate(question.updated_at)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <QuestionEditModal
                              question={question}
                              onSave={handleSaveQuestion}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </QuestionEditModal>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>暂无题目数据</p>
                {(filters.title || filters.subject || filters.type || filters.start_date || filters.end_date) && (
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
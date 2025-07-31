'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Label } from '@/component/label'
import { Badge } from '@/component/badge'
import { ArrowLeft, Save, Trash2, Edit, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Exam, ExamStatus } from '@/entity/exam'
import { Question, QuestionType } from '@/entity/question'

import { QuestionShow } from '@/feature/QuestionShow'
import { QuestionEditModal } from '@/feature/QuestionEditModal'
import { getExam } from '@/api/axios/exam'
import { updateQuestion } from '@/api/axios/question'
import { toast } from 'sonner'

export default function ExamEditPage() {
  const params = useParams()
  const examId = params.id as string
  const queryClient = useQueryClient()

  const [questions, setQuestions] = useState<Question[]>([])
  const [isEditingExam, setIsEditingExam] = useState(false)
  const [examFormData, setExamFormData] = useState({
    plan_starttime: '',
    plan_duration: 0
  })

  // 获取考试数据
  const { data: exam, isLoading, error } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => getExam(examId),
    enabled: !!examId,
    staleTime: 2 * 60 * 1000, // 2分钟缓存
  })

  // 更新考试信息
  const updateExamMutation = useMutation({
    mutationFn: async (updatedExam: Partial<Exam>) => {
      // TODO: 实现更新考试的API调用
      console.log('更新考试数据:', updatedExam)
      return updatedExam
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam', examId] })
      toast.success('考试信息已更新')
    },
    onError: () => {
      toast.error('更新失败，请重试')
    }
  })

  // 当考试数据加载完成时，初始化状态
  useEffect(() => {
    if (exam) {
      setQuestions(exam.questions || [])
    }
  }, [exam])

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId))
  }

  const handleEditQuestion = async (updatedQuestion: Question) => {
    await updateQuestion(updatedQuestion.id, updatedQuestion)
    setQuestions(prev =>
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    )
    toast.success('题目已更新')
  }

  const handleEditExam = () => {
    if (exam) {
      // 将 ISO 日期时间转换为 datetime-local 格式
      const dateTimeLocal = new Date(exam.plan_starttime).toISOString().slice(0, 16)
      setExamFormData({
        plan_starttime: dateTimeLocal,
        plan_duration: exam.plan_duration
      })
      setIsEditingExam(true)
    }
  }

  const handleSaveExam = () => {
    if (!exam) return

    // 将 datetime-local 格式转换为 ISO 格式
    const isoDateTime = new Date(examFormData.plan_starttime).toISOString()

    const updatedExam = {
      ...exam,
      plan_starttime: isoDateTime,
      plan_duration: examFormData.plan_duration,
      updated_at: new Date().toISOString()
    }

    updateExamMutation.mutate(updatedExam)
    setIsEditingExam(false)
  }

  const handleCancelEdit = () => {
    setIsEditingExam(false)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">加载失败，请重试</p>
          <Button onClick={() => window.location.reload()}>
            重新加载
          </Button>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">考试不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/goal/${exam.goal_id}`} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回目标详情
            </Link>
          </Button>
        </div>

        {/* 考试信息 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>考试信息</span>
              {exam.status === ExamStatus.PENDING && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditExam}
                  disabled={isEditingExam}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  编辑
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              {exam.status === ExamStatus.PENDING ? '编辑考试信息（仅未开始状态可编辑）' : '查看考试信息'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 考试标题 */}
              <div className="flex items-center space-x-2">
                <Label className="text-sm text-gray-500 min-w-fit">考试标题：</Label>
                <span className="text-sm font-medium">{exam.title}</span>
              </div>

              {/* 考试状态信息 */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm text-gray-500">状态：</Label>
                  <Badge variant={exam.status === ExamStatus.COMPLETED ? "default" : "secondary"}>
                    {exam.status === ExamStatus.COMPLETED ? '已完成' :
                      exam.status === ExamStatus.PENDING ? '待开始' :
                        exam.status === ExamStatus.PREPARING ? '准备中' : '失败'}
                  </Badge>
                </div>

                {exam.status === ExamStatus.COMPLETED ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm text-gray-500">完成时间：</Label>
                      <span className="text-sm">{exam.finished_at ? formatDateTime(exam.finished_at) : '-'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm text-gray-500">实际用时：</Label>
                      <span className="text-sm">{formatDuration(exam.actual_duration || 0)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    {isEditingExam ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm text-gray-500">计划开始时间：</Label>
                          <input
                            type="datetime-local"
                            value={examFormData.plan_starttime}
                            onChange={(e) => setExamFormData(prev => ({ ...prev, plan_starttime: e.target.value }))}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm text-gray-500">计划用时（分钟）：</Label>
                          <input
                            type="number"
                            min="1"
                            value={examFormData.plan_duration}
                            onChange={(e) => setExamFormData(prev => ({ ...prev, plan_duration: parseInt(e.target.value) || 0 }))}
                            className="text-sm border border-gray-300 rounded px-2 py-1 w-20"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveExam}
                            disabled={updateExamMutation.isPending}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            保存
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            取消
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm text-gray-500">计划开始时间：</Label>
                          <span className="text-sm">{formatDateTime(exam.plan_starttime)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm text-gray-500">计划用时：</Label>
                          <span className="text-sm">{formatDuration(exam.plan_duration)}</span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 题目列表 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>题目列表</span>
              <Badge variant="secondary">{questions.length} 道题</Badge>
            </CardTitle>
            <CardDescription>
              管理考试题目，支持删除和添加新题目
            </CardDescription>
          </CardHeader>
          <CardContent>
            {questions.length > 0 ? (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">第 {index + 1} 题</Badge>
                        <Badge variant="secondary">{question.type}</Badge>
                        {question.subject && (
                          <Badge variant="secondary">{question.subject}</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <QuestionEditModal
                          question={question}
                          onSave={handleEditQuestion}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="编辑题目"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </QuestionEditModal>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="删除题目"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <QuestionShow
                      question={question}
                      onChange={(updatedQuestion) => {
                        setQuestions(prev =>
                          prev.map(q => q.id === question.id ? updatedQuestion : q)
                        )
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>暂无题目，请添加题目</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


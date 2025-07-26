'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Input } from '@/component/input'
import { Label } from '@/component/label'
import { Badge } from '@/component/badge'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Exam, ExamStatus } from '@/entity/exam'
import { Question, QuestionType } from '@/entity/question'

import { QuestionShow } from '@/feature/QuestionShow'
import { getExam } from '@/api/axios/exam'
import { toast } from 'sonner'

export default function ExamEditPage() {
  const params = useParams()
  const examId = params.id as string
  const queryClient = useQueryClient()

  const [questions, setQuestions] = useState<Question[]>([])

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

  const handleSave = () => {
    if (!exam) return

    const updatedExam = {
      ...exam,
      questions: questions,
      question_ids: questions.map(q => q.id),
      updated_at: new Date().toISOString()
    }

    updateExamMutation.mutate(updatedExam)
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
            <CardTitle>考试信息</CardTitle>
            <CardDescription>
              编辑考试标题和查看考试状态
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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



        {/* 保存按钮 */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            size="lg"
            className="px-8"
            disabled={updateExamMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {updateExamMutation.isPending ? '保存中...' : '保存考试'}
          </Button>
        </div>
      </div>
    </div>
  )
}


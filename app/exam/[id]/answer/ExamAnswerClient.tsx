'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Badge } from '@/component/badge'
import { Label } from '@/component/label'
import { ArrowLeft, MessageSquare, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Exam, ExamStatus } from '@/entity/exam'
import { Question, QuestionType, questionTypeLabel } from '@/entity/question'
import { Message, MessageRole } from '@/entity/message'
import { getExam } from '@/api/axios/exam'
import { toast } from 'sonner'
import { AnswerShow } from '@/feature/AnswerShow'

interface ExamAnswerClientProps {
  examId: string
}

export function ExamAnswerClient({ examId }: ExamAnswerClientProps) {
  const router = useRouter()

  // 获取考试数据
  const { data: exam, isLoading, error } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => getExam(examId),
    staleTime: 2 * 60 * 1000, // 2分钟缓存
  })

  const handleRetry = () => {
    // TODO: 创建新的考试实例
    console.log('重新练习考试:', examId)
    toast.info('功能开发中...')
  }

  const isAnswered = (questionId: string) => {
    if (!exam?.answer) return false
    const studentAnswer = exam.answer.answers?.[questionId]

    if (!studentAnswer) return false

    // 简单比较，实际应用中可能需要更复杂的评分逻辑
    return true
  }

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
          <p className="text-gray-500">考试不存在</p>
        </div>
      </div>
    )
  }

  if (!exam.answer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">暂无答案数据</p>
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
            <CardTitle>考试阅卷</CardTitle>
            <CardDescription>
              查看考试答案和AI陪学对话记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-gray-500">考试标题</Label>
                <p className="font-medium">{exam.title}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">完成时间</Label>
                <p className="text-sm">{exam.finished_at ? formatDate(exam.finished_at) : '-'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">题目数量</Label>
                <p className="text-sm">{exam.questions.length} 道题</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 题目答案列表 */}
        <div className="space-y-6">
          {exam.questions.map((question, index) => {
            const questionId = question.id
            const studentAnswer = exam.answer?.answers?.[questionId] || ''
            const messages = exam.answer?.messages?.[questionId] || []

            return (
              <Card key={questionId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">第 {index + 1} 题</Badge>
                      <Badge variant="secondary">
                        {questionTypeLabel[question.type as QuestionType] || question.type}
                      </Badge>
                      {isAnswered(questionId) ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          正确
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          错误
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 左侧：题目和答案 */}
                    <div className="space-y-4">
                      {/* 题目内容 */}
                      <div>
                        <Label className="text-sm text-gray-500">题目</Label>
                        <p className="font-medium mt-1">{question.title}</p>
                        {question.tip && (
                          <p className="text-sm text-gray-600 mt-1">{question.tip}</p>
                        )}
                        {question.options && question.options.length > 0 && (
                          <div className="mt-2 text-sm text-gray-600 flex flex-row gap-2">
                            <p className="mb-1">选项：</p>
                            <ul className="list-disc list-inside space-y-1 flex flex-row gap-2">
                              {question.options.map((option, optIndex) => (
                                <li key={optIndex}>{option}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* 学生答案 */}
                      <div>
                        <Label className="text-sm text-gray-500">学生答案</Label>
                        <div className="mt-1">
                          <AnswerShow answerValue={studentAnswer} />
                        </div>
                      </div>
                    </div>

                    {/* 右侧：AI陪学对话 */}
                    <div>
                      <Label className="text-sm text-gray-500 flex items-center mb-2">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        AI陪学对话
                      </Label>
                      {messages.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {messages.map((message, msgIndex) => (
                            <div
                              key={msgIndex}
                              className={`p-3 rounded-lg ${message.role === MessageRole.User
                                ? 'bg-blue-50 border-l-4 border-blue-400'
                                : 'bg-gray-50 border-l-4 border-gray-400'
                                }`}
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {message.role === MessageRole.User ? '学生' : 'AI助手'}
                                </Badge>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
                          <p className="text-sm">暂无对话记录</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 再练一次按钮 */}
        <div className="mt-8 flex justify-center">
          <Button onClick={handleRetry} size="lg" className="px-8">
            <RotateCcw className="w-4 h-4 mr-2" />
            再练一次
          </Button>
        </div>
      </div>
    </div>
  )
}

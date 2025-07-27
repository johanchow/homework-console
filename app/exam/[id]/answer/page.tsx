'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Badge } from '@/component/badge'
import { Label } from '@/component/label'
import { ArrowLeft, MessageSquare, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Exam, ExamStatus } from '@/entity/exam'
import { Question } from '@/entity/question'
import { Message, MessageRole } from '@/entity/message'

// 模拟数据
const mockExam: Exam = {
  id: '1',
  goal_id: '1',
  title: '考试1',
  question_ids: ['1', '2', '3'],
  questions: [],
  examinee_id: '1',
  status: ExamStatus.COMPLETED,
  plan_duration: 60,
  plan_starttime: '2024-01-15T10:00:00Z',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z'
}

export default function ExamAnswerPage() {
  const params = useParams()
  const examId = params.id as string

  const [exam, setExam] = useState<Exam>(mockExam)

  useEffect(() => {
    // TODO: 根据examId获取exam数据
    console.log('获取exam答案数据:', examId)
  }, [examId])

  const handleRetry = () => {
    // TODO: 创建新的考试实例
    console.log('重新练习考试:', examId)
  }

  const getQuestionTypeLabel = (type: string) => {
    const typeMap = {
      choice: '选择题',
      qa: '问答题',
      judge: '判断题'
    }
    return typeMap[type as keyof typeof typeMap] || type
  }

  const isAnswerCorrect = (questionId: string) => {
    if (!exam.answer) return false
    const question = exam.answer.question[questionId]
    const studentAnswer = exam.answer.answer[questionId]

    if (!question || !studentAnswer) return false

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
                <Label className="text-sm text-gray-500">考生ID</Label>
                <p className="font-medium">{exam.examinee_id}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">完成时间</Label>
                <p className="text-sm">{exam.finished_at ? formatDate(exam.finished_at) : '-'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">题目数量</Label>
                <p className="text-sm">{Object.keys(exam.answer.question).length} 道题</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 题目答案列表 */}
        <div className="space-y-6">
          {Object.keys(exam.answer.question).map((questionId, index) => {
            const question = exam.answer!.question[questionId]
            const studentAnswer = exam.answer!.answer[questionId]
            const messages = exam.answer!.messages[questionId] || []
            const isCorrect = isAnswerCorrect(questionId)

            return (
              <Card key={questionId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">第 {index + 1} 题</Badge>
                      <Badge variant="secondary">{getQuestionTypeLabel(question.type)}</Badge>
                      {isCorrect ? (
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
                <CardContent className="space-y-6">
                  {/* 题目内容 */}
                  <div>
                    <Label className="text-sm text-gray-500">题目</Label>
                    <p className="font-medium mt-1">{question.title}</p>
                    {question.options && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p className="mb-1">选项：</p>
                        <ul className="list-disc list-inside space-y-1">
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
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm">{studentAnswer}</p>
                    </div>
                  </div>

                  {/* 正确答案 */}
                  <div>
                    <Label className="text-sm text-gray-500">正确答案</Label>
                    <div className="mt-1 p-3 bg-green-50 rounded-md">
                      <p className="text-sm text-green-800">{question.id}</p>
                    </div>
                  </div>

                  {/* AI陪学对话 */}
                  {messages.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-500 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        AI陪学对话
                      </Label>
                      <div className="mt-2 space-y-3 max-h-64 overflow-y-auto">
                        {messages.map((message, msgIndex) => (
                          <div
                            key={msgIndex}
                            className={`p-3 rounded-lg ${message.role === MessageRole.User
                              ? 'bg-blue-50 ml-4'
                              : 'bg-gray-50 mr-4'
                              }`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {message.role === MessageRole.User ? '学生' : 'AI助手'}
                              </Badge>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
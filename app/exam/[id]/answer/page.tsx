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
  id: 'exam-1',
  goal_id: '1',
  question_ids: ['1', '2', '3'],
  examinee_id: 'student-001',
  status: ExamStatus.COMPLETED,
  created_at: '2024-01-16T09:00:00Z',
  updated_at: '2024-01-16T10:30:00Z',
  finished_at: '2024-01-16T10:30:00Z',
  answer: {
    question: {
      '1': {
        id: '1',
        subject: '数学',
        type: 'choice' as any,
        title: '求函数 f(x) = x² + 2x + 1 的导数',
        options: ['2x + 2', '2x + 1', 'x + 2', 'x + 1'],
        answer: '2x + 2',
        creator_id: 'teacher-001',
        created_at: new Date('2024-01-15T10:00:00Z'),
        updated_at: new Date('2024-01-15T10:00:00Z')
      },
      '2': {
        id: '2',
        subject: '数学',
        type: 'qa' as any,
        title: '解释什么是微积分的基本定理',
        answer: '微积分基本定理建立了微分和积分之间的关系...',
        creator_id: 'teacher-001',
        created_at: new Date('2024-01-15T10:30:00Z'),
        updated_at: new Date('2024-01-15T10:30:00Z')
      },
      '3': {
        id: '3',
        subject: '数学',
        type: 'judge' as any,
        title: '导数的几何意义是函数图像在某点的切线斜率',
        answer: '正确',
        creator_id: 'teacher-001',
        created_at: new Date('2024-01-15T11:00:00Z'),
        updated_at: new Date('2024-01-15T11:00:00Z')
      }
    },
    answer: {
      '1': '2x + 2',
      '2': '微积分基本定理是指定积分与不定积分之间的关系，它表明如果F(x)是f(x)的一个原函数，那么∫[a,b]f(x)dx = F(b) - F(a)。这个定理建立了微分和积分之间的桥梁，是微积分学的核心定理。',
      '3': '正确'
    },
    messages: {
      '1': [
        {
          role: MessageRole.User,
          content: '这道题我不太会做，能帮我分析一下吗？',
          message_type: 'text' as any
        },
        {
          role: MessageRole.Assistant,
          content: '好的，让我帮你分析这道求导题。对于函数f(x) = x² + 2x + 1，我们需要使用求导法则。首先，x²的导数是2x，2x的导数是2，常数1的导数是0。所以f\'(x) = 2x + 2。',
          message_type: 'text' as any
        },
        {
          role: MessageRole.User,
          content: '明白了，谢谢！',
          message_type: 'text' as any
        }
      ],
      '2': [
        {
          role: MessageRole.User,
          content: '微积分基本定理是什么？',
          message_type: 'text' as any
        },
        {
          role: MessageRole.Assistant,
          content: '微积分基本定理是微积分学中最重要的定理之一，它建立了微分和积分之间的关系。简单来说，它告诉我们如何通过求原函数来计算定积分。',
          message_type: 'text' as any
        }
      ],
      '3': [
        {
          role: MessageRole.User,
          content: '导数的几何意义是什么？',
          message_type: 'text' as any
        },
        {
          role: MessageRole.Assistant,
          content: '导数的几何意义是函数图像在某点的切线斜率。这意味着导数告诉我们函数在该点的变化率。',
          message_type: 'text' as any
        }
      ]
    }
  }
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
    return question.answer === studentAnswer
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
                      <p className="text-sm text-green-800">{question.answer}</p>
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
                            className={`p-3 rounded-lg ${
                              message.role === MessageRole.User
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
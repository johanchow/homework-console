'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Input } from '@/component/input'
import { Label } from '@/component/label'
import { Badge } from '@/component/badge'
import { ArrowLeft, Save, Trash2, Plus, Bot, Upload } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ExamFull as Exam } from '@/entity/exam'
import { Question, QuestionType } from '@/entity/question'
import { QuestionFromAI } from '@/feature/QuestionFromAI'
import { QuestionFromImport } from '@/feature/QuestionFromImport'

// 模拟数据
const mockExam: Exam = {
  id: 'exam-1',
  goal_id: '1',
  question_ids: ['1', '2', '3'],
  examinee_id: 'student-001',
  status: 'pending' as any,
  created_at: '2024-01-16T09:00:00Z',
  updated_at: '2024-01-16T10:30:00Z',
  goal: {
    id: '1',
    name: '掌握高等数学微积分',
    subject: '数学',
    ai_prompt: '这是一个关于高等数学微积分的学习目标',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:20:00Z'
  },
  questions: [
    {
      id: '1',
      subject: '数学',
      type: QuestionType.choice,
      title: '求函数 f(x) = x² + 2x + 1 的导数',
      options: ['2x + 2', '2x + 1', 'x + 2', 'x + 1'],
      answer: '2x + 2',
      creator_id: 'teacher-001',
      created_at: new Date('2024-01-15T10:00:00Z'),
      updated_at: new Date('2024-01-15T10:00:00Z')
    },
    {
      id: '2',
      subject: '数学',
      type: QuestionType.qa,
      title: '解释什么是微积分的基本定理',
      answer: '微积分基本定理建立了微分和积分之间的关系...',
      creator_id: 'teacher-001',
      created_at: new Date('2024-01-15T10:30:00Z'),
      updated_at: new Date('2024-01-15T10:30:00Z')
    },
    {
      id: '3',
      subject: '数学',
      type: QuestionType.judge,
      title: '导数的几何意义是函数图像在某点的切线斜率',
      answer: '正确',
      creator_id: 'teacher-001',
      created_at: new Date('2024-01-15T11:00:00Z'),
      updated_at: new Date('2024-01-15T11:00:00Z')
    }
  ]
}

export default function ExamEditPage() {
  const params = useParams()
  const examId = params.id as string
  
  const [exam, setExam] = useState<Exam>(mockExam)
  const [title, setTitle] = useState(exam.goal.name)
  const [questions, setQuestions] = useState<Question[]>(exam.questions)

  useEffect(() => {
    // TODO: 根据examId获取exam数据
    console.log('获取exam数据:', examId)
  }, [examId])

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId))
  }

  const handleAddQuestions = (newQuestions: any[]) => {
    // 转换新题目格式并添加到列表
    const convertedQuestions: Question[] = newQuestions.map((q, index) => ({
      id: `new-${Date.now()}-${index}`,
      subject: exam.goal.subject,
      type: q.type || 'choice',
      title: q.title,
      options: q.options,
      answer: q.answer || '',
      creator_id: 'current-user',
      created_at: new Date(),
      updated_at: new Date()
    }))
    
    setQuestions(prev => [...prev, ...convertedQuestions])
  }

  const handleQuestionSelected = (question: Question) => {
    // 转换单个题目格式并添加到列表
    const convertedQuestion: Question = {
      id: `new-${Date.now()}`,
      subject: exam.goal.subject,
      type: question.type || QuestionType.choice,
      title: question.title,
      options: question.options,
      answer: question.answer || '',
      creator_id: 'current-user',
      created_at: new Date(),
      updated_at: new Date()
    }
    
    setQuestions(prev => [...prev, convertedQuestion])
  }

  const handleSave = () => {
    const updatedExam = {
      ...exam,
      goal: {
        ...exam.goal,
        name: title
      },
      questions: questions,
      question_ids: questions.map(q => q.id),
      updated_at: new Date().toISOString()
    }
    
    setExam(updatedExam)
    // TODO: 调用API保存数据
    console.log('保存exam数据:', updatedExam)
  }

  const getQuestionTypeLabel = (type: QuestionType) => {
    const typeMap = {
      [QuestionType.choice]: '选择题',
      [QuestionType.qa]: '问答题',
      [QuestionType.judge]: '判断题'
    }
    return typeMap[type] || type
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

        {/* 考试标题编辑 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>考试信息</CardTitle>
            <CardDescription>
              编辑考试标题和题目内容
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">考试标题</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入考试标题"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label className="text-sm text-gray-500">科目：</Label>
                <Badge variant="secondary">{exam.goal.subject}</Badge>
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
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">第 {index + 1} 题</Badge>
                        <Badge variant="secondary">{getQuestionTypeLabel(question.type)}</Badge>
                      </div>
                      <p className="font-medium mb-2">{question.title}</p>
                      {question.options && (
                        <div className="text-sm text-gray-600">
                          <p className="mb-1">选项：</p>
                          <ul className="list-disc list-inside space-y-1">
                            {question.options.map((option, optIndex) => (
                              <li key={optIndex}>{option}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {question.answer && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">答案：{question.answer}</p>
                        </div>
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
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>暂无题目，请添加题目</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 添加题目 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>添加题目</CardTitle>
            <CardDescription>
              通过AI生成或导入方式添加新题目
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <QuestionFromAI onQuestionSelected={handleQuestionSelected}>
                <Button variant="outline">
                  <Bot className="w-4 h-4 mr-2" />
                  AI出题
                </Button>
              </QuestionFromAI>
              <QuestionFromImport onQuestionSelected={handleQuestionSelected}>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  智能录入
                </Button>
              </QuestionFromImport>
            </div>
          </CardContent>
        </Card>

        {/* 保存按钮 */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" className="px-8">
            <Save className="w-4 h-4 mr-2" />
            保存考试
          </Button>
        </div>
      </div>
    </div>
  )
}


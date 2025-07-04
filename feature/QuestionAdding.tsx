'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Badge } from '@/component/badge'
import { Bot, Upload, Trash2 } from 'lucide-react'

interface Question {
  id: number
  title: string
  type: string
  difficulty: string
  subject: string
}

interface Goal {
  id?: number
  name: string
  questions: Question[]
  assignees: any[]
  startDate: string
  endDate: string
}

interface QuestionAddingProps {
  goal: Goal
  onQuestionsUpdated: (questions: Question[]) => void
}

// 模拟题目数据
const mockQuestions = [
  {
    id: 1,
    title: '微积分基本定理的应用',
    type: '计算题',
    difficulty: '中等',
    subject: '数学'
  },
  {
    id: 2,
    title: '导数的几何意义',
    type: '选择题',
    difficulty: '简单',
    subject: '数学'
  },
  {
    id: 3,
    title: '定积分的计算方法',
    type: '计算题',
    difficulty: '困难',
    subject: '数学'
  }
]

export function QuestionAdding({ goal, onQuestionsUpdated }: QuestionAddingProps) {
  const [questions, setQuestions] = useState<Question[]>(goal.questions || mockQuestions)

  const handleAIQuestion = () => {
    // TODO: 实现AI出题逻辑
    console.log('AI出题')
    // 模拟添加新题目
    const newQuestion: Question = {
      id: Date.now(),
      title: `AI生成的题目 ${questions.length + 1}`,
      type: '选择题',
      difficulty: '中等',
      subject: '数学'
    }
    const updatedQuestions = [...questions, newQuestion]
    setQuestions(updatedQuestions)
    onQuestionsUpdated(updatedQuestions)
  }

  const handleSmartImport = () => {
    // TODO: 实现智能录入逻辑
    console.log('智能录入')
    // 模拟批量添加题目
    const newQuestions: Question[] = [
      {
        id: Date.now(),
        title: '智能录入题目 1',
        type: '填空题',
        difficulty: '简单',
        subject: '数学'
      },
      {
        id: Date.now() + 1,
        title: '智能录入题目 2',
        type: '计算题',
        difficulty: '困难',
        subject: '数学'
      }
    ]
    const updatedQuestions = [...questions, ...newQuestions]
    setQuestions(updatedQuestions)
    onQuestionsUpdated(updatedQuestions)
  }

  const handleDeleteQuestion = (questionId: number) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId)
    setQuestions(updatedQuestions)
    onQuestionsUpdated(updatedQuestions)
  }

  return (
    <div className="space-y-6">
      {/* 已出题目列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              2
            </span>
            题目管理
          </CardTitle>
          <CardDescription>
            为您的学习目标添加练习题，可以通过AI出题或智能录入的方式
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 题目统计 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">已添加题目：</span>
                <span className="text-lg font-semibold text-blue-600">{questions.length}</span>
              </div>
              <Badge variant="secondary">数学</Badge>
            </div>

            {/* 题目列表 */}
            <div className="space-y-3">
              {questions.map((question) => (
                <div key={question.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{question.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">{question.type}</Badge>
                      <Badge variant="outline" className="text-xs">{question.difficulty}</Badge>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 添加题目按钮 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleAIQuestion}
              className="h-16 flex flex-col items-center justify-center space-y-2"
            >
              <Bot className="w-6 h-6" />
              <span>AI出题</span>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleSmartImport}
              className="h-16 flex flex-col items-center justify-center space-y-2"
            >
              <Upload className="w-6 h-6" />
              <span>智能录入</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

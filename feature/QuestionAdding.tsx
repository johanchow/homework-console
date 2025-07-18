'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Badge } from '@/component/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/component/tabs'
import { Upload, Trash2, Bot } from 'lucide-react'
import { QuestionFromAI } from './QuestionFromAI'
import { QuestionFromImport } from './QuestionFromImport'
import { Question, questionTypeLabel } from '@/entity/question'

interface QuestionAddingProps {
  currentQuestions: Question[];
  onQuestionsUpdated: (questions: Question[]) => void
  prompt?: string;
  onPromptUpdated?: (prompt: string) => void;
}

export function QuestionAdding({ currentQuestions, onQuestionsUpdated, prompt, onPromptUpdated }: QuestionAddingProps) {
  const [questions, setQuestions] = useState<Question[]>(currentQuestions)

  const handleAIQuestionSelected = (question: Question) => {
    const updatedQuestions = [...questions, question]
    setQuestions(updatedQuestions)
    onQuestionsUpdated(updatedQuestions)
  }

  const handleImportQuestionSelected = (question: Question) => {
    const updatedQuestions = [...questions, question]
    setQuestions(updatedQuestions)
    onQuestionsUpdated(updatedQuestions)
  }

  const handleDeleteQuestion = (questionId: string) => {
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
              <div className="flex items-center space-x-4">
                {questions.map((question) => (
                  <Badge variant="secondary" key={question.id}>{question.title}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 题目列表 */}
          <div className="space-y-3">
            {questions.map((question) => (
              <div key={question.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{question.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">{questionTypeLabel[question.type]}</Badge>
                    <Badge variant="outline" className="text-xs">{question.subject}</Badge>
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
        </CardContent>
      </Card>

      {/* 添加题目 - Tab形式 */}
      <Card>
        <CardHeader>
          <CardTitle>添加题目</CardTitle>
          <CardDescription>
            通过AI生成或导入方式添加新题目
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="import" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import" className="flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                智能录入
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center">
                <Bot className="w-4 h-4 mr-2" />
                AI出题
              </TabsTrigger>
            </TabsList>

            {/* AI出题Tab */}
            <TabsContent value="ai" className="space-y-6">
              <QuestionFromAI
                onQuestionSelected={handleAIQuestionSelected}
                prompt={prompt}
                onPromptUpdated={onPromptUpdated}
              />
            </TabsContent>

            {/* 智能录入Tab */}
            <TabsContent value="import" className="space-y-6">
              <QuestionFromImport onQuestionSelected={handleImportQuestionSelected} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div >
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { ArrowLeft, Save } from 'lucide-react'
import { QuestionAdding } from '@/feature/QuestionAdding'
import { batchCreateQuestions } from '@/api/axios/question'
import { toast } from 'sonner'
import { Question } from '@/entity/question'

export default function QuestionCreatePage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])

  // 使用 React Query mutation
  const createQuestionsMutation = useMutation({
    mutationFn: (questionsToSubmit: Omit<Question, 'id'>[]) => batchCreateQuestions(questionsToSubmit as any),
    onSuccess: (response) => {
      toast.success(`成功创建 ${response.questions.length} 道题目`)
      router.push('/question')
    },
    onError: (error) => {
      console.error('创建题目失败:', error)
      toast.error('创建题目失败，请重试')
    }
  })

  const handleQuestionsUpdated = (newQuestions: Question[]) => {
    setQuestions(newQuestions)
  }

  const validateQuestions = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (questions.length === 0) {
      errors.push('请至少添加一道题目')
      return { isValid: false, errors }
    }

    questions.forEach((question, index) => {
      if (!question.title || question.title.trim() === '') {
        errors.push(`第 ${index + 1} 题：题目标题不能为空`)
      }
      if (!question.subject || question.subject.trim() === '') {
        errors.push(`第 ${index + 1} 题：科目不能为空`)
      }
      if (!question.type) {
        errors.push(`第 ${index + 1} 题：题目类型不能为空`)
      }
    })

    return { isValid: errors.length === 0, errors }
  }

  const handleSubmit = () => {
    const validation = validateQuestions()

    if (!validation.isValid) {
      validation.errors.forEach(error => {
        toast.error(error)
      })
      return
    }

    // 准备提交的数据，移除临时ID
    const questionsToSubmit = questions.map(question => {
      const { id, ...questionWithoutId } = question
      return questionWithoutId
    }) as Omit<Question, 'id'>[]

    // 使用 mutation 提交数据
    createQuestionsMutation.mutate(questionsToSubmit)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和返回按钮 */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">创建题目</h1>
          </div>
        </div>

        {/* 主要内容 */}
        <div className="space-y-6">
          <QuestionAdding
            currentQuestions={questions}
            onQuestionsUpdated={handleQuestionsUpdated}
          />

          {/* 提交按钮 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center">
                <Button
                  onClick={handleSubmit}
                  disabled={createQuestionsMutation.isPending || questions.length === 0}
                  size="lg"
                  className="min-w-[140px]"
                >
                  {createQuestionsMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      提交中...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      提交
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Button } from '@/component/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/component/card'
import { Badge } from '@/component/badge'
import { ArrowLeft, Edit, Eye } from 'lucide-react'
import { getQuestion, updateQuestion } from '@/api/axios/question'
import { QuestionShow } from '@/feature/QuestionShowRead'
import { QuestionEditModal } from '@/feature/QuestionEditModal'
import { toast } from 'sonner'

interface QuestionClientProps {
  questionId: string
}

export function QuestionClient({ questionId }: QuestionClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isEditMode, setIsEditMode] = useState(false)

  const { data: question, isLoading, error } = useQuery({
    queryKey: ['question', questionId],
    queryFn: () => getQuestion(questionId),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })

  const updateQuestionMutation = useMutation({
    mutationFn: (data: any) => updateQuestion(questionId, data),
    onSuccess: (updatedQuestion) => {
      // 更新缓存中的题目数据
      queryClient.setQueryData(['question', questionId], updatedQuestion)
      toast.success('题目已更新')
      setIsEditMode(false)
    },
    onError: (error) => {
      console.error('更新题目失败:', error)
      toast.error('更新题目失败，请重试')
    }
  })

  const handleSaveQuestion = (updatedQuestion: any) => {
    updateQuestionMutation.mutate(updatedQuestion)
  }

  const handleBack = () => {
    router.push('/question')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">加载题目失败</p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回题目列表
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">题目不存在</p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回题目列表
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部导航 */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={handleBack} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回题目列表
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsEditMode(!isEditMode)}
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              disabled={updateQuestionMutation.isPending}
            >
              {isEditMode ? (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  查看模式
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  编辑模式
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 题目详情 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>题目详情</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">ID: {question.id}</Badge>
                {question.subject && (
                  <Badge variant="secondary">{question.subject}</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionShow
              question={question}
              onChange={(updatedQuestion) => {
                // 这里可以处理题目更新
                console.log('Question updated:', updatedQuestion)
              }}
            />

            {isEditMode && (
              <QuestionEditModal
                question={question}
                onSave={handleSaveQuestion}
                open={isEditMode}
                onOpenChange={(open) => {
                  if (!open) {
                    setIsEditMode(false)
                  }
                }}
              >
                <div className="hidden">
                  {/* 隐藏的触发器，用于自动打开 modal */}
                </div>
              </QuestionEditModal>
            )}
          </CardContent>
        </Card>

        {/* 题目元信息 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">题目信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">创建时间：</span>
                  <span>{question.created_at ? new Date(question.created_at).toLocaleString('zh-CN') : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">更新时间：</span>
                  <span>{question.updated_at ? new Date(question.updated_at).toLocaleString('zh-CN') : '-'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">创建者：</span>
                  <span>{question.creator_id || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">题目类型：</span>
                  <span>{question.type}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Input } from '@/component/input'
import { Label } from '@/component/label'
import { Badge } from '@/component/badge'
import { Trash2, ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import { QuestionAdding } from '@/feature/QuestionAdding'
import { QuestionEditModal } from '@/feature/QuestionEditModal'
import { useUserStore } from '@/store/useUserStore'
import { Exam, ExamStatus, Question, Goal, questionTypeIcon, questionTypeLabel } from '@/entity'
import { createExam, getGoal, batchCreateQuestions } from '@/api/axios'
import { Duration } from '@/component/duration'
import Calendar from '@/component/calendar'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/component/form'

// 获取当前日期的格式化字符串
const getCurrentDateString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}考试`
}

// 获取当前时间的格式化字符串
const getCurrentDateTimeString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// 表单验证schema
const examCreateSchema = z.object({
  title: z.string().min(1, '请输入考试标题'),
  plan_starttime: z.string().optional().refine(
    (value) => !value || value.length > 0,
    { message: '请选择计划开始时间' }
  ),
  plan_duration: z.object({
    hours: z.number().min(0, '小时不能为负数'),
    minutes: z.number().min(0, '分钟不能为负数').max(59, '分钟不能超过59'),
  }).optional().refine(
    (duration) => !duration || (duration.hours > 0 || duration.minutes > 0),
    { message: '请设置计划用时' }
  ),
  questions: z.array(z.any()).min(1, '请至少添加一道题目'),
})

type ExamCreateFormData = z.infer<typeof examCreateSchema>

export default function CreateExamPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const goalId = searchParams.get('goal_id')
  const { user } = useUserStore()

  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  const form = useForm<ExamCreateFormData>({
    resolver: zodResolver(examCreateSchema),
    defaultValues: {
      title: getCurrentDateString(),
      plan_starttime: getCurrentDateTimeString(),
      plan_duration: { hours: 0, minutes: 30 },
      questions: [],
    },
  })

  // 获取goal详情
  useEffect(() => {
    if (goalId) {
      const fetchGoal = async () => {
        try {
          const goalData = await getGoal(goalId)
          setGoal(goalData)
          // 如果有goal，使用goal的名称作为标题
          form.setValue('title', goalData.name || getCurrentDateString())
        } catch (error) {
          console.error('获取目标详情失败:', error)
          toast.error('获取目标详情失败')
        }
      }
      fetchGoal()
    }
  }, [goalId, user?.id, form])

  const handleQuestionsUpdated = (questions: Question[]) => {
    form.setValue('questions', questions)
  }

  const handleDeleteQuestion = (questionId: string) => {
    const currentQuestions = form.getValues('questions')
    const updatedQuestions = currentQuestions.filter((q: Question) => q.id !== questionId)
    form.setValue('questions', updatedQuestions)
  }

  const handleEditQuestion = (questionId: string) => {
    const currentQuestions = form.getValues('questions')
    const question = currentQuestions.find((q: Question) => q.id === questionId)
    if (question) {
      setEditingQuestion(question)
    }
  }

  const handleSaveEditedQuestion = (editedQuestion: Question) => {
    const currentQuestions = form.getValues('questions')
    const updatedQuestions = currentQuestions.map((q: Question) =>
      q.id === editedQuestion.id ? editedQuestion : q
    )
    form.setValue('questions', updatedQuestions)
    setEditingQuestion(null)
    toast.success('题目更新成功')
  }

  const handleSubmit = async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      return
    }

    const data = form.getValues()

    // 移除考生ID验证逻辑

    setLoading(true)
    // 先创建考试，再创建考试题目

    try {
      // 1. 批量创建题目
      const newQuestions = data.questions.map(question => ({
        ...question,
        creator_id: user?.id,
      }))
      const { questions } = await batchCreateQuestions(newQuestions)
      // 2. 再创建考试
      const exam = {
        goal_id: goalId,
        question_ids: questions.map(question => question.id),
        examinee_id: '',  // 移除考生ID字段
        status: ExamStatus.PENDING,
        plan_duration: data.plan_duration ? data.plan_duration.hours * 60 + data.plan_duration.minutes : 0,
        plan_starttime: data.plan_starttime || '',
      }
      const examResp = await createExam(exam)
      toast.success('考试创建成功')
      router.push(`/exam/${examResp.id}`)
    } catch (error) {
      console.error('创建考试失败:', error)
      toast.error('创建考试失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        <Form {...form}>
          {/* 题目管理 */}
          <Card>
            <CardHeader>
              <CardTitle>题目管理 <span className="text-red-500">*</span></CardTitle>
              <CardDescription>
                管理考试题目
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 已选题目列表 */}
              {form.watch('questions').length > 0 && (
                <div className="mb-6">
                  <Label className="text-sm font-medium">已选题目 ({form.watch('questions').length})</Label>
                  <div className="mt-2 space-y-2">
                    {form.watch('questions').map((question: Question, index: number) => (
                      <div key={question.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">#{index + 1}</span>
                          <span className="text-lg">{questionTypeIcon[question.type]}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-2">{question.title}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {questionTypeLabel[question.type]}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {question.subject}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditQuestion(question.id)}
                            className="text-blue-500 hover:text-blue-700"
                            title="编辑题目"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-red-500 hover:text-red-700"
                            title="删除题目"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 添加题目 */}
              <QuestionAdding
                currentQuestions={form.watch('questions')}
                onQuestionsUpdated={handleQuestionsUpdated}
              />

              <FormField
                control={form.control}
                name="questions"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 考试标题 */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>考试标题 <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入考试标题"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Goal信息（如果有goal_id） */}
              {goal && (
                <div className="space-y-2">
                  <Label>关联目标</Label>
                  <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{goal.name}</p>
                        <p className="text-sm text-gray-500">{goal.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 移除考生ID输入项 */}

              {/* 开始时间和预计用时 */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="plan_starttime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>计划开始时间</FormLabel>
                      <FormControl>
                        <Calendar
                          selected={field.value}
                          onSelect={(date) => field.onChange(date || '')}
                          placeholder="选择开始时间"
                          precision="minute"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plan_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>计划用时</FormLabel>
                      <FormControl>
                        <Duration
                          value={field.value}
                          onChange={field.onChange}
                          label=""
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <div className="flex justify-end space-x-4">
            <Link href="/exam">
              <Button variant="outline" type="button">
                取消
              </Button>
            </Link>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? '创建中...' : '创建考试'}
            </Button>
          </div>
        </Form>

        {/* 编辑题目模态框 */}
        {editingQuestion && (
          <QuestionEditModal
            question={editingQuestion}
            onSave={handleSaveEditedQuestion}
            open={!!editingQuestion}
            onOpenChange={(open) => {
              if (!open) {
                setEditingQuestion(null)
              }
            }}
          >
            <div className="hidden">
              {/* 隐藏的触发器，用于自动打开 modal */}
            </div>
          </QuestionEditModal>
        )}
      </div>
    </div>
  )
}
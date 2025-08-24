'use client'

import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUserStore } from '@/store/useUserStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Label } from '@/component/label'
import { Badge } from '@/component/badge'
import { ArrowLeft, Save, Trash2, Edit, Calendar, Plus, Download } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/component/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/component/popover'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Exam, ExamStatus } from '@/entity/exam'
import { Question } from '@/entity/question'
import { batchCreateQuestions } from '@/api/axios/question'

import { QuestionShow } from '@/feature/QuestionShowRead'
import { QuestionEditModal } from '@/feature/QuestionEditModal'
import { QuestionAdding } from '@/feature/QuestionAdding'
import { QuestionImport } from '@/feature/QuestionImport'
import { getExam, updateExam } from '@/api/axios/exam'
import { updateQuestion } from '@/api/axios/question'
import { toLocalDateTimeString } from '@/util/formatter'

// 定义表单验证模式
const examFormSchema = z.object({
  title: z.string().min(1, '考试标题不能为空').max(100, '考试标题不能超过100个字符'),
  plan_starttime: z.string().min(1, '请选择开始时间'),
  plan_duration: z.number().min(1, '考试时长不能少于1分钟').max(480, '考试时长不能超过8小时'),
})

type ExamFormData = z.infer<typeof examFormSchema>

export default function ExamEditPage() {
  const params = useParams()
  const examId = params.id as string
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useUserStore();

  const [questions, setQuestions] = useState<Question[]>([])
  const [isEditingExam, setIsEditingExam] = useState(false)

  // 使用 react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ExamFormData>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: '',
      plan_starttime: '',
      plan_duration: 0,
    },
  })
  const [showQuestionAdding, setShowQuestionAdding] = useState(false)
  const [showQuestionImport, setShowQuestionImport] = useState(false)
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<string | null>(null)

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
      console.log('更新考试数据:', updatedExam)
      await updateExam(examId, updatedExam)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam', examId] })
      toast.success('考试信息已更新')
    },
    onError: () => {
      toast.error('更新失败，请重试')
    }
  })

  // 更新题目
  const updateQuestionMutation = useMutation({
    mutationFn: async (updatedQuestion: Partial<Question>) => {
      if (!updatedQuestion.id) {
        throw new Error('题目ID不能为空')
      }
      await updateQuestion(updatedQuestion.id, updatedQuestion)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam', examId] })
      toast.success('题目已更新')
    },
    onError: () => {
      toast.error('更新失败，请重试')
    }
  })

  const batchCreateQuestionsMutation = useMutation({
    mutationFn: async (questions: Question[]) => {
      const { questions: newQuestions } = await batchCreateQuestions(questions)
      return newQuestions
    },
    onError: () => {
      toast.error('创建失败，请重试')
    }
  })

  // 当考试数据加载完成时，初始化状态
  useEffect(() => {
    console.log('exam change: ', exam);
    if (exam) {
      setQuestions(exam.questions || [])
    }
  }, [exam])

  const handleDeleteQuestion = async (questionId: string) => {
    await updateExamMutation.mutateAsync({
      question_ids: exam?.question_ids?.filter(id => id !== questionId) || []
    });

    setQuestions(prev => prev.filter(q => q.id !== questionId))
    toast.success('题目已删除')
  }

  const handleEditQuestion = async (updatedQuestion: Question) => {
    updateQuestionMutation.mutate(updatedQuestion)
  }

  const handleEditExam = () => {
    if (exam) {
      reset({
        title: exam.title,
        plan_starttime: toLocalDateTimeString(new Date(exam.plan_starttime)),
        plan_duration: exam.plan_duration
      })
      setIsEditingExam(true)
    }
  }

  const handleSaveExam = (data: ExamFormData) => {
    if (!exam) return

    // 将 datetime-local 格式转换为 ISO 格式
    const isoDateTime = new Date(data.plan_starttime).toISOString()

    const updatedExam = {
      ...exam,
      title: data.title.trim(),
      plan_starttime: isoDateTime,
      plan_duration: data.plan_duration,
      updated_at: new Date().toISOString()
    }

    updateExamMutation.mutate(updatedExam)
    setIsEditingExam(false)
  }

  const handleCancelEdit = () => {
    setIsEditingExam(false)
  }

  const handleImportQuestions = async (questionIds: string[]) => {
    const originalQuestionIds = exam?.question_ids || []
    await updateExamMutation.mutateAsync({
      question_ids: [...originalQuestionIds, ...questionIds]
    })
    toast.success(`已导入 ${questionIds.length} 道题目`)
  }

  const handleAddQuestions = async (addedQuestions: Question[]) => {
    // 先发送创建题目请求
    const addedQuestions2 = addedQuestions.map(question => ({
      ...question,
      creator_id: user?.id,
    }))
    const newQuestions = await batchCreateQuestionsMutation.mutateAsync(addedQuestions2)
    // 再更新考试题目
    await updateExamMutation.mutateAsync({
      question_ids: [...exam?.question_ids || [], ...newQuestions.map(q => q.id)]
    })
    setShowQuestionAdding(false)
    toast.success(`已添加 ${newQuestions.length} 道新题目`)
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
            <div onClick={() => router.back()} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </div>
          </Button>
        </div>

        {/* 考试信息 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>考试信息</span>
              {exam.status === ExamStatus.PENDING && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditExam}
                  disabled={isEditingExam}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  编辑
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              {exam.status === ExamStatus.PENDING ? '编辑考试信息（仅未开始状态可编辑）' : '查看考试信息'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 考试标题 */}
              <div className="flex items-center space-x-2">
                <Label className="text-sm text-gray-500 min-w-fit">考试标题：</Label>
                {isEditingExam ? (
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      {...register('title')}
                      className={`text-sm border rounded px-2 py-1 w-full ${errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="请输入考试标题"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm font-medium">{exam.title}</span>
                )}
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
                    {isEditingExam ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm text-gray-500">计划开始时间：</Label>
                          <div>
                            <input
                              type="datetime-local"
                              {...register('plan_starttime')}
                              className={`text-sm border rounded px-2 py-1 ${errors.plan_starttime ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.plan_starttime && (
                              <p className="text-red-500 text-xs mt-1">{errors.plan_starttime.message}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm text-gray-500">计划用时（分钟）：</Label>
                          <div>
                            <input
                              type="number"
                              min="1"
                              {...register('plan_duration', { valueAsNumber: true })}
                              className={`text-sm border rounded px-2 py-1 w-20 ${errors.plan_duration ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.plan_duration && (
                              <p className="text-red-500 text-xs mt-1">{errors.plan_duration.message}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSubmit(handleSaveExam)}
                            disabled={isSubmitting || updateExamMutation.isPending}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            保存
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            取消
                          </Button>
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
              <div className="flex items-center space-x-4">
                <Badge variant="secondary">{questions.length} 道题</Badge>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowQuestionImport(true)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>导入题目</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowQuestionAdding(true)}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>新建题目</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardTitle>
            <CardDescription>
              管理考试题目，支持导入已有题目和创建新题目
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
                      <div className="flex items-center space-x-2">
                        <QuestionEditModal
                          question={question}
                          onSave={handleEditQuestion}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="编辑题目"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </QuestionEditModal>
                        <Popover open={deletePopoverOpen === question.id} onOpenChange={(open) => setDeletePopoverOpen(open ? question.id : null)}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="删除题目"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <h4 className="font-medium leading-none">确认删除题目</h4>
                                <p className="text-sm text-muted-foreground">
                                  确定要删除第 {index + 1} 题 "{question.title}" 吗？此操作不可撤销。
                                </p>
                              </div>
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeletePopoverOpen(null)}
                                >
                                  取消
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    handleDeleteQuestion(question.id)
                                    setDeletePopoverOpen(null)
                                  }}
                                >
                                  删除
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
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

        {/* 导入题目模态框 */}
        <QuestionImport
          open={showQuestionImport}
          onOpenChange={setShowQuestionImport}
          onImport={handleImportQuestions}
          existingQuestionIds={questions.map(q => q.id)}
        />

        {/* 新建题目模态框 */}
        {showQuestionAdding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex-1 overflow-auto p-6">
                <QuestionAdding
                  currentQuestions={[]}
                  onQuestionsUpdated={(newQuestions) => {
                    handleAddQuestions(newQuestions)
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


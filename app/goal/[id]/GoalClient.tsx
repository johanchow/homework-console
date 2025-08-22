'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Input } from '@/component/input'
import { Label } from '@/component/label'
import { Badge } from '@/component/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/select'
import { ArrowLeft, Edit, Save, X, Eye, Trash2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GoalStatus } from '@/entity/goal'
import { Exam, ExamStatus } from '@/entity/exam'
import { getGoal, updateGoal, deleteGoal } from '@/api/axios/goal'
import { listExams, deleteExam } from '@/api/axios/exam'
import { Popover, PopoverContent, PopoverTrigger } from '@/component/popover'
import { toast } from 'sonner'

const statusConfig = {
  [ExamStatus.PENDING]: { label: '待开始', color: 'bg-gray-100 text-gray-800' },
  [ExamStatus.COMPLETED]: { label: '已完成', color: 'bg-green-100 text-green-800' },
  [ExamStatus.FAILED]: { label: '未通过', color: 'bg-red-100 text-red-800' },
  [ExamStatus.PREPARING]: { label: '准备中', color: 'bg-blue-100 text-blue-800' }
}

const goalStatusConfig = {
  [GoalStatus.preparing]: { label: '准备中', color: 'bg-blue-100 text-blue-800' },
  [GoalStatus.doing]: { label: '进行中', color: 'bg-yellow-100 text-yellow-800' },
  [GoalStatus.passed]: { label: '已通过', color: 'bg-green-100 text-green-800' },
  [GoalStatus.cancelled]: { label: '已取消', color: 'bg-red-100 text-red-800' }
}

interface GoalClientProps {
  goalId: string
}

export function GoalClient({ goalId }: GoalClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    status: GoalStatus.preparing
  })
  const [goalDeleteOpen, setGoalDeleteOpen] = useState(false)
  const [examDeleteOpen, setExamDeleteOpen] = useState<string | null>(null)

  // 获取 Goal 数据（使用预取的数据）
  const { data: goal, isLoading: goalLoading, error: goalError } = useQuery({
    queryKey: ['goal', goalId],
    queryFn: () => getGoal(goalId),
    enabled: !!goalId,
    staleTime: 2 * 60 * 1000, // 2分钟缓存
  })

  // 获取相关考试列表（使用预取的数据）
  const { data: examsData, isLoading: examsLoading } = useQuery({
    queryKey: ['exams', { goal_id: goalId }],
    queryFn: () => listExams({ goal_id: goalId }, { page: 1, page_size: 100 }),
    enabled: !!goalId,
    staleTime: 2 * 60 * 1000, // 2分钟缓存
  })
  console.log('goal exams len: ', examsData?.exams?.length);

  // 更新 Goal 的 mutation
  const updateGoalMutation = useMutation({
    mutationFn: async (data: { name: string; status: GoalStatus }) => {
      return updateGoal(goalId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] })
      setIsEditing(false)
      toast.success('目标更新成功')
    },
    onError: () => {
      toast.error('目标更新失败')
    }
  })

  // 删除 Goal 的 mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async () => {
      console.log('删除 Goal:', goalId)
      return deleteGoal(goalId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      router.push('/goal')
      toast.success('目标删除成功')
    },
    onError: () => {
      toast.error('目标删除失败')
    }
  })

  // 删除 Exam 的 mutation
  const deleteExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      return deleteExam(examId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', { goal_id: goalId }] })
      router.push('/goal')
      toast.success('考试记录删除成功')
    },
    onError: () => {
      toast.error('考试记录删除失败')
    }
  })

  // ✅ 修复：将 handleDelete 移到所有 hooks 之后
  const handleDelete = () => {
    deleteGoalMutation.mutate()
  }

  const handleEdit = () => {
    if (goal) {
      setIsEditing(true)
      setEditData({
        name: goal.name,
        status: goal.status
      })
    }
  }

  const handleSave = () => {
    if (editData.name.trim()) {
      updateGoalMutation.mutate(editData)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (goal) {
      setEditData({
        name: goal.name,
        status: goal.status
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
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

  const getStatusBadge = (status: ExamStatus) => {
    const config = statusConfig[status]
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getGoalStatusBadge = (status: GoalStatus) => {
    const config = goalStatusConfig[status]
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getExamButton = (exam: Exam) => {
    if (exam.status === ExamStatus.COMPLETED) {
      return (
        <Button variant="outline" size="sm" asChild className="ml-2">
          <Link href={`/exam/${exam.id}/answer`}>
            <Eye className="w-4 h-4 mr-1" />
            阅卷
          </Link>
        </Button>
      )
    } else {
      return (
        <Button variant="outline" size="sm" asChild className="ml-2">
          <Link href={`/exam/${exam.id}`}>
            <Eye className="w-4 h-4 mr-1" />
            查看
          </Link>
        </Button>
      )
    }
  }

  if (goalLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (goalError || !goal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">无法加载目标详情</p>
          <Button asChild>
            <Link href="/goal">返回目标列表</Link>
          </Button>
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
            <Link href="/goal" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回目标列表
            </Link>
          </Button>
        </div>

        {/* Goal详情卡片 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">学习目标详情</CardTitle>
                <CardDescription>
                  管理学习目标信息和查看相关考试记录
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                {!isEditing ? (
                  <>
                    <Button onClick={handleEdit} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      编辑
                    </Button>
                    <Popover open={goalDeleteOpen} onOpenChange={setGoalDeleteOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="end">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm">确认删除</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              确定要删除学习目标 "{goal.name}" 吗？此操作不可撤销，相关的考试记录也会被删除。
                            </p>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setGoalDeleteOpen(false)}
                            >
                              取消
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                handleDelete()
                                setGoalDeleteOpen(false)
                              }}
                            >
                              确认删除
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSave}
                      disabled={!editData.name.trim() || updateGoalMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateGoalMutation.isPending ? '保存中...' : '保存'}
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      取消
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 目标名称 */}
              <div className="space-y-2">
                <Label htmlFor="name">目标名称</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="输入学习目标名称"
                  />
                ) : (
                  <p className="text-lg font-medium text-gray-900">{goal.name}</p>
                )}
              </div>

              {/* 科目 */}
              <div className="space-y-2">
                <Label>学习科目</Label>
                <Badge variant="secondary" className="text-sm">
                  {goal.subject}
                </Badge>
              </div>

              {/* 状态 */}
              <div className="space-y-2">
                <Label htmlFor="status">目标状态</Label>
                {isEditing ? (
                  <Select value={editData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(goalStatusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1">
                    {getGoalStatusBadge(goal.status)}
                  </div>
                )}
              </div>

              {/* AI提示词 */}
              {goal.ai_prompt && (
                <div className="space-y-2">
                  <Label>AI提示词</Label>
                  <p className="text-gray-600">{goal.ai_prompt}</p>
                </div>
              )}

              {/* 时间信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm text-gray-500">创建时间</Label>
                  <p className="text-sm">{formatDate(goal.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">更新时间</Label>
                  <p className="text-sm">{formatDate(goal.updated_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>相关考试记录</span>
              <Badge variant="secondary">
                {examsLoading ? '加载中...' : (examsData?.exams?.length || 0)} 条记录
              </Badge>
            </CardTitle>
            <CardDescription>
              查看所有与此学习目标相关的考试记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            {examsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">加载考试记录中...</p>
              </div>
            ) : examsData?.exams && examsData.exams.length > 0 ? (
              <div className="space-y-4">
                {examsData.exams.map((exam: Exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500">考生ID</Label>
                        <p className="font-medium">{exam.examinee_id}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">状态</Label>
                        <div className="mt-1">
                          {getStatusBadge(exam.status)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">创建时间</Label>
                        <p className="text-sm">{formatDate(exam.created_at)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">完成时间</Label>
                        <p className="text-sm">
                          {exam.finished_at ? formatDate(exam.finished_at) : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getExamButton(exam)}
                      <Popover open={examDeleteOpen === exam.id} onOpenChange={(open) => setExamDeleteOpen(open ? exam.id : null)}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deleteExamMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            删除
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-4" align="end">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-sm">确认删除考试记录</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                确定要删除这条考试记录吗？此操作不可撤销。
                              </p>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExamDeleteOpen(null)}
                              >
                                取消
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  deleteExamMutation.mutate(exam.id)
                                  setExamDeleteOpen(null)
                                }}
                              >
                                确认删除
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>暂无考试记录</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
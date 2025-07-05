'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Input } from '@/component/input'
import { Label } from '@/component/label'
import { Badge } from '@/component/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/select'
import { ArrowLeft, Edit, Save, X, Eye, FileText } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { GoalFull as Goal } from '@/entity/goal'
import { Exam, ExamStatus } from '@/entity/exam'

// 模拟数据
const mockGoal: Goal = {
  id: '1',
  name: '掌握高等数学微积分',
  subject: '数学',
  ai_prompt: '这是一个关于高等数学微积分的学习目标',
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-20T14:20:00Z',
  exams: [
    {
      id: 'exam-1',
      examinee_id: 'student-001',
      status: ExamStatus.COMPLETED,
      created_at: '2024-01-16T09:00:00Z',
      finished_at: '2024-01-16T10:30:00Z',
      goal_id: '1',
      question_ids: ['1', '2', '3'],
      updated_at: '2024-01-16T10:30:00Z'
    },
    {
      id: 'exam-2',
      examinee_id: 'student-002',
      status: ExamStatus.PENDING,
      created_at: '2024-01-17T14:00:00Z',
      goal_id: '1',
      question_ids: ['4', '5', '6'],
      updated_at: '2024-01-17T14:00:00Z'
    },
    {
      id: 'exam-3',
      examinee_id: 'student-003',
      status: ExamStatus.PENDING,
      created_at: '2024-01-18T11:00:00Z',
      goal_id: '1',
      question_ids: ['7', '8', '9'],
      updated_at: '2024-01-18T11:00:00Z'
    },
    {
      id: 'exam-4',
      examinee_id: 'student-004',
      status: ExamStatus.FAILED,
      created_at: '2024-01-19T16:00:00Z',
      finished_at: '2024-01-19T17:15:00Z',
      goal_id: '1',
      question_ids: ['10', '11', '12'],
      updated_at: '2024-01-19T17:15:00Z'
    }
  ]
}

const subjects = ['数学', '英语', '计算机科学', '物理', '化学', '历史', '地理', '生物', '政治', '语文']

const statusConfig = {
  [ExamStatus.PENDING]: { label: '待开始', color: 'bg-gray-100 text-gray-800' },
  [ExamStatus.COMPLETED]: { label: '已完成', color: 'bg-green-100 text-green-800' },
  [ExamStatus.FAILED]: { label: '未通过', color: 'bg-red-100 text-red-800' }
}

export default function GoalDetailPage() {
  const params = useParams()
  const goalId = params.id as string
  
  const [goal, setGoal] = useState<Goal>(mockGoal)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: goal.name,
    subject: goal.subject
  })

  useEffect(() => {
    // TODO: 根据goalId获取goal数据
    console.log('获取goal数据:', goalId)
  }, [goalId])

  const handleEdit = () => {
    setIsEditing(true)
    setEditData({
      name: goal.name,
      subject: goal.subject
    })
  }

  const handleSave = () => {
    setGoal(prev => ({
      ...prev,
      name: editData.name,
      subject: editData.subject,
      updated_at: new Date().toISOString()
    }))
    setIsEditing(false)
    // TODO: 调用API保存数据
    console.log('保存goal数据:', editData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({
      name: goal.name,
      subject: goal.subject
    })
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

  const getExamButton = (exam: Exam) => {
    if (exam.status === ExamStatus.COMPLETED) {
      return (
        <Button variant="outline" size="sm" asChild className="ml-4">
          <Link href={`/exam/${exam.id}/answer`}>
            <FileText className="w-4 h-4 mr-1" />
            阅卷
          </Link>
        </Button>
      )
    } else {
      return (
        <Button variant="outline" size="sm" asChild className="ml-4">
          <Link href={`/exam/${exam.id}`}>
            <Eye className="w-4 h-4 mr-1" />
            查看
          </Link>
        </Button>
      )
    }
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
              {!isEditing ? (
                <Button onClick={handleEdit} variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  编辑
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} disabled={!editData.name.trim()}>
                    <Save className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    取消
                  </Button>
                </div>
              )}
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
                <Label htmlFor="subject">学习科目</Label>
                {isEditing ? (
                  <Select value={editData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择科目" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary" className="text-sm">
                    {goal.subject}
                  </Badge>
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
              <Badge variant="secondary">{goal.exams.length} 条记录</Badge>
            </CardTitle>
            <CardDescription>
              查看所有与此学习目标相关的考试记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            {goal.exams.length > 0 ? (
              <div className="space-y-4">
                {goal.exams.map((exam) => (
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
                    {getExamButton(exam)}
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
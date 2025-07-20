'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Input } from '@/component/input'
import { Label } from '@/component/label'
import { ArrowLeft, ArrowRight, Users } from 'lucide-react'
import Link from 'next/link'
import { QuestionAdding } from '@/feature/QuestionAdding'
import { useUserStore } from '@/store/useUserStore'
import { Exam, Goal, Question, ExamStatus } from '@/entity'
import { createGoal, batchCreateQuestions, createExam } from '@/api/axios'
import { Duration } from '@/component/duration'
import Calendar from '@/component/calendar'

interface GoalCreateFormData extends Pick<Goal, 'name' | 'subject' | 'ai_prompt'> {
  questions: Question[]
  assignees: string[]
  start_time?: string
  duration?: { hours: number; minutes: number }
}

export default function CreateGoalPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const { user } = useUserStore();
  const [formData, setFormData] = useState<GoalCreateFormData>({
    name: '',
    subject: '',
    ai_prompt: '',
    questions: [],
    assignees: [],
    start_time: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDurationChange = (duration: { hours: number; minutes: number }) => {
    setFormData(prev => ({
      ...prev,
      duration
    }))
  }

  const handleQuestionsUpdated = (questions: Question[]) => {
    setFormData(prev => ({
      ...prev,
      questions
    }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // TODO: 实现创建逻辑
    console.log('创建目标:', formData)
    // 1. 先创建目标
    const newGoal = {
      name: formData.name,
      subject: formData.subject || 'math',
      creator_id: user?.id,
    }
    const goal = await createGoal(newGoal)
    // 2. 再批量创建题目
    const newQuestions = formData.questions.map(question => ({
      ...question,
      creator_id: user?.id,
    }))
    const { questions } = await batchCreateQuestions(newQuestions)
    // 3. 再创建考试
    const newExam = {
      goal_id: goal.id,
      question_ids: questions.map(question => question.id),
      examinee_id: user?.id,
      status: ExamStatus.PENDING,
      plan_duration: formData.duration!.hours * 60 + formData.duration!.minutes,
      plan_starttime: formData.start_time!,
    }
    const exam = await createExam(newExam)
    alert('创建成功');
  }

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
            1
          </span>
          设定学习目标
        </CardTitle>
        <CardDescription>
          为您的学习目标起一个清晰的名称，这将帮助您更好地规划学习路径
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">目标名称 *</Label>
            <Input
              id="name"
              placeholder="例如：掌握高等数学微积分"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="pt-4">
            <Button
              onClick={handleNext}
              disabled={!formData.name.trim()}
              className="w-full"
            >
              下一步
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* 使用QuestionAdding组件 */}
      <QuestionAdding
        onPromptUpdated={(prompt) => handleInputChange('ai_prompt', prompt)}
        currentQuestions={formData.questions}
        onQuestionsUpdated={handleQuestionsUpdated}
      />

      {/* 导航按钮 */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrev}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          上一步
        </Button>
        <Button onClick={handleNext}>
          下一步
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
            3
          </span>
          指派学习人
        </CardTitle>
        <CardDescription>
          选择学习目标和设置学习时间（可选）
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 指派学习人 */}
          <div className="space-y-2">
            <Label>指派学习人</Label>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">张三</p>
                    <p className="text-sm text-gray-500">学生</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  选择
                </Button>
              </div>
            </div>
          </div>

          {/* 开始时间和预计用时 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>开始时间（可选）</Label>
              <Calendar
                selected={formData.start_time}
                onSelect={(date) => handleInputChange('start_time', date || '')}
                placeholder="选择开始时间"
                precision="minute"
              />
            </div>

            <Duration
              value={formData.duration}
              onChange={handleDurationChange}
              label="预计用时（可选）"
            />
          </div>

          {/* 导航按钮 */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handlePrev}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              上一步
            </Button>
            <Button onClick={handleSubmit}>
              创建目标
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/goal" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回目标列表
          </Link>
        </Button>
      </div>

      {/* 步骤指示器 */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step <= currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500'
                }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-0.5 mx-2 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            {currentStep === 1 && '设定学习目标'}
            {currentStep === 2 && '导入题目'}
            {currentStep === 3 && '指派学习人'}
          </p>
        </div>
      </div>

      {/* 步骤内容 */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </div>
  )
}

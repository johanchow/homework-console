'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/component/dialog'
import { Button } from '@/component/button'
import { Input } from '@/component/input'
import { Label } from '@/component/label'
import { Badge } from '@/component/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/select'
import { Plus, X, Save, Edit } from 'lucide-react'
import { Question, QuestionType } from '@/entity/question'

interface QuestionEditModalProps {
  question?: Question
  onSave: (question: Question) => void
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const subjects = ['数学', '英语', '计算机科学', '物理', '化学', '历史', '地理', '生物', '政治', '语文']

export function QuestionEditModal({ question, onSave, children, open, onOpenChange }: QuestionEditModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  // 使用外部控制的 open 状态，如果没有提供则使用内部状态
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen
  const [formData, setFormData] = useState<Partial<Question>>({
    title: '',
    subject: '数学',
    type: QuestionType.choice,
    options: [],
    material: '',
    images: [],
    videos: [],
    audios: []
  })

  useEffect(() => {
    if (question) {
      setFormData({
        id: question.id,
        title: question.title,
        subject: question.subject,
        type: question.type,
        options: question.options || [],
        material: question.material || '',
        images: question.images || [],
        videos: question.videos || [],
        audios: question.audios || [],
        creator_id: question.creator_id,
        created_at: question.created_at,
        updated_at: question.updated_at
      })
    }
  }, [question])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])]
    newOptions[index] = value
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }))
  }

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }))
  }

  const removeOption = (index: number) => {
    const newOptions = [...(formData.options || [])]
    newOptions.splice(index, 1)
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }))
  }

  const handleMediaChange = (type: 'images' | 'videos' | 'audios', value: string) => {
    const mediaList = formData[type] || []
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [type]: [...mediaList, value.trim()]
      }))
    }
  }

  const removeMedia = (type: 'images' | 'videos' | 'audios', index: number) => {
    const mediaList = [...(formData[type] || [])]
    mediaList.splice(index, 1)
    setFormData(prev => ({
      ...prev,
      [type]: mediaList
    }))
  }

  const handleSave = () => {
    if (!formData.title?.trim()) {
      alert('请输入题目标题')
      return
    }

    if (formData.type === QuestionType.choice && (!formData.options || formData.options.length < 2)) {
      alert('选择题至少需要2个选项')
      return
    }

    const updatedQuestion: Question = {
      id: formData.id || `question-${Date.now()}`,
      title: formData.title,
      tip: '',
      subject: formData.subject || '数学',
      type: formData.type || QuestionType.choice,
      options: formData.type === QuestionType.choice ? formData.options : undefined,
      material: formData.material,
      images: formData.images,
      videos: formData.videos,
      audios: formData.audios,
      creator_id: formData.creator_id || 'current-user',
      created_at: formData.created_at || '',
      updated_at: formData.updated_at || ''
    }

    onSave(updatedQuestion)
    setIsOpen(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // 重置表单数据
      if (question) {
        setFormData({
          id: question.id,
          title: question.title,
          subject: question.subject,
          type: question.type,
          options: question.options || [],
          images: question.images || [],
          videos: question.videos || [],
          audios: question.audios || [],
          creator_id: question.creator_id,
          created_at: question.created_at,
          updated_at: question.updated_at
        })
      }
    }
  }

  const getQuestionTypeLabel = (type: QuestionType) => {
    const typeMap = {
      [QuestionType.choice]: '选择题',
      [QuestionType.qa]: '问答题',
      [QuestionType.judge]: '判断题'
    }
    return typeMap[type as keyof typeof typeMap] || type
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {open === undefined && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit className="w-5 h-5 mr-2" />
            {question ? '编辑题目' : '新建题目'}
          </DialogTitle>
          <DialogDescription>
            修改题目的详细信息
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">题目标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="输入题目标题"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">科目</Label>
              <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
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
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">题目类型</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value as QuestionType)}>
              <SelectTrigger>
                <SelectValue placeholder="选择题目类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QuestionType.choice}>选择题</SelectItem>
                <SelectItem value={QuestionType.qa}>问答题</SelectItem>
                <SelectItem value={QuestionType.judge}>判断题</SelectItem>
                <SelectItem value={QuestionType.reading}>阅读题</SelectItem>
                <SelectItem value={QuestionType.summary}>总结题</SelectItem>
                <SelectItem value={QuestionType.show}>表演题</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 选项（仅选择题） */}
          {formData.type === QuestionType.choice && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>选项</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加选项
                </Button>
              </div>
              <div className="space-y-2">
                {(formData.options || []).map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`选项 ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 答案 */}
          {formData.type === QuestionType.reading &&
            <div className="space-y-2">
              <Label htmlFor="answer">材料</Label>
              <textarea
                id="answer"
                value={formData.material}
                onChange={(e) => handleInputChange('answer', e.target.value)}
                placeholder="输入答案"
                rows={4}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          }

          {/* 媒体文件 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">媒体文件</h3>

            {/* 图片 */}
            <div className="space-y-2">
              <Label>图片文件</Label>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="输入图片文件名"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const target = e.target as HTMLInputElement
                      handleMediaChange('images', target.value)
                      target.value = ''
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement
                    handleMediaChange('images', input.value)
                    input.value = ''
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {(formData.images || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.images?.map((image, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{image}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedia('images', index)}
                        className="h-auto p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 视频 */}
            <div className="space-y-2">
              <Label>视频文件</Label>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="输入视频文件名"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const target = e.target as HTMLInputElement
                      handleMediaChange('videos', target.value)
                      target.value = ''
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement
                    handleMediaChange('videos', input.value)
                    input.value = ''
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {(formData.videos || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.videos?.map((video, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{video}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedia('videos', index)}
                        className="h-auto p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 音频 */}
            <div className="space-y-2">
              <Label>音频文件</Label>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="输入音频文件名"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const target = e.target as HTMLInputElement
                      handleMediaChange('audios', target.value)
                      target.value = ''
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement
                    handleMediaChange('audios', input.value)
                    input.value = ''
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {(formData.audios || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.audios?.map((audio, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{audio}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedia('audios', index)}
                        className="h-auto p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

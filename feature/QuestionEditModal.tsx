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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/select'
import { Plus, X, Save, Edit, Upload, Image, Video, Music, FileText } from 'lucide-react'
import { Question, QuestionSubject, QuestionType, questionSubjectLabel, questionTypeLabel } from '@/entity/question'
import { uploadFile } from '@/api/axios/cos'
import { extractQuestionMaterial } from '@/api/axios/question'

interface QuestionEditModalProps {
  question?: Question
  onSave: (question: Question) => void
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

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
    material: {
      file_order: [],
    },
    images: [],
    videos: [],
    audios: []
  })

  // 获取material中的文件内容
  const getMaterialFiles = () => {
    if (!formData.material || !formData.material.file_order) return []

    return formData.material.file_order.map((fileId: string) => ({
      id: fileId,
      content: (formData.material![fileId] as string) || ''
    }))
  }

  // 更新material文件内容
  const updateMaterialFile = (fileId: string, content: string) => {
    setFormData(prev => {
      if (!prev.material) {
        return {
          ...prev,
          material: {
            file_order: [fileId],
            [fileId]: content
          }
        }
      }

      return {
        ...prev,
        material: {
          ...prev.material,
          [fileId]: content
        }
      }
    })
  }

  // 删除material文件
  const removeMaterialFile = (fileId: string) => {
    setFormData(prev => {
      if (!prev.material) return prev

      const newMaterial = { ...prev.material }
      delete newMaterial[fileId]

      return {
        ...prev,
        material: {
          ...newMaterial,
          file_order: prev.material.file_order.filter((id: string) => id !== fileId)
        }
      }
    })
  }

  useEffect(() => {
    if (question) {
      setFormData({
        id: question.id,
        title: question.title,
        subject: question.subject,
        type: question.type,
        options: question.options || [],
        material: question.material,
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

  // 文件上传处理
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'videos' | 'audios') => {
    const files = Array.from(event.target.files || [])

    for (const file of files) {
      try {
        const result = await uploadFile(file)
        if (result.success) {
          setFormData(prev => ({
            ...prev,
            [type]: [...(prev[type] || []), result.url!]
          }))

          // 如果是阅读题类型，调用extractQuestionMaterial提取文件内容
          if (formData.type === QuestionType.reading) {
            try {
              const extractedContent = await extractQuestionMaterial(result.url!)
              const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

              setFormData(prev => {
                if (!prev.material) {
                  return {
                    ...prev,
                    material: {
                      file_order: [fileId],
                      [fileId]: extractedContent
                    }
                  }
                }

                return {
                  ...prev,
                  material: {
                    ...prev.material,
                    file_order: [...prev.material.file_order, fileId],
                    [fileId]: extractedContent
                  }
                }
              })
            } catch (extractError) {
              console.error('提取文件内容失败:', extractError)
            }
          }
        }
      } catch (error) {
        console.error('文件上传失败:', error)
      } finally {
      }
    }

    // 清空 input 值，允许重复上传同一文件
    event.target.value = ''
  }

  const getFileIcon = (type: 'images' | 'videos' | 'audios') => {
    switch (type) {
      case 'images':
        return <Image className="w-4 h-4 text-blue-500" />
      case 'videos':
        return <Video className="w-4 h-4 text-purple-500" />
      case 'audios':
        return <Music className="w-4 h-4 text-green-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
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
          material: question.material,
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
                  {Object.values(QuestionSubject).map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {questionSubjectLabel[subject]}
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
                {Object.values(QuestionType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {questionTypeLabel[type]}
                  </SelectItem>
                ))}
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

          {/* 阅读题 */}
          {formData.type === QuestionType.reading && (
            <div className="space-y-3">
              <Label htmlFor="material">材料</Label>
              <div className="space-y-3">
                {getMaterialFiles().map((file: { id: string; content: string }, index: number) => (
                  <div key={file.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">文件 {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMaterialFile(file.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <textarea
                      value={file.content}
                      onChange={(e) => updateMaterialFile(file.id, e.target.value)}
                      placeholder="输入材料内容"
                      rows={4}
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 媒体文件 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">媒体文件</h3>

            {/* 图片 */}
            <div className="space-y-2">
              <Label>图片文件</Label>
              <div className="flex flex-wrap gap-2 items-center">
                {/* 已有图片预览 */}
                {(formData.images || []).map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`图片 ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedia('images', index)}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                {/* 上传按钮 */}
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'images')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* 视频 */}
            <div className="space-y-2">
              <Label>视频文件</Label>
              <div className="flex flex-wrap gap-2 items-center">
                {/* 已有视频预览 */}
                {(formData.videos || []).map((video, index) => (
                  <div key={index} className="relative group">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <Video className="w-6 h-6 text-gray-500" />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedia('videos', index)}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                {/* 上传按钮 */}
                <label htmlFor="video-upload" className="cursor-pointer">
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                  <input
                    type="file"
                    id="video-upload"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'videos')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* 音频 */}
            <div className="space-y-2">
              <Label>音频文件</Label>
              <div className="flex flex-wrap gap-2 items-center">
                {/* 已有音频预览 */}
                {(formData.audios || []).map((audio, index) => (
                  <div key={index} className="relative group">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <Music className="w-6 h-6 text-gray-500" />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedia('audios', index)}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                {/* 上传按钮 */}
                <label htmlFor="audio-upload" className="cursor-pointer">
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                  <input
                    type="file"
                    id="audio-upload"
                    accept="audio/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'audios')}
                    className="hidden"
                  />
                </label>
              </div>
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

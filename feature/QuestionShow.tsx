'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Input } from '@/component/input'
import { Label } from '@/component/label'
import { Badge } from '@/component/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/select'
import { Upload, X, Image as ImageIcon, Video, Volume2, Trash2 } from 'lucide-react'
import { Question, QuestionType } from '@/entity/question'
import { uploadFile } from '@/api/axios/cos'

interface QuestionShowProps {
  question: Question
  enableChange?: boolean
  onChange?: (question: Question) => void
}

export function QuestionShow({ question, enableChange = false, onChange }: QuestionShowProps) {
  const [editingQuestion, setEditingQuestion] = useState<Question>(question)
  const [isUploading, setIsUploading] = useState(false)

  const handleInputChange = (field: keyof Question, value: any) => {
    const updatedQuestion = {
      ...editingQuestion,
      [field]: value,
      updated_at: new Date()
    }
    setEditingQuestion(updatedQuestion)
    onChange?.(updatedQuestion)
  }

  const handleOptionChange = (index: number, value: string) => {
    const options = [...(editingQuestion.options || [])]
    options[index] = value
    handleInputChange('options', options)
  }

  const handleAddOption = () => {
    const options = [...(editingQuestion.options || []), '']
    handleInputChange('options', options)
  }

  const handleRemoveOption = (index: number) => {
    const options = editingQuestion.options?.filter((_, i) => i !== index) || []
    handleInputChange('options', options)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'videos' | 'audios') => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    try {
      const uploadPromises = files.map(file => uploadFile(file))
      const results = await Promise.all(uploadPromises)
      const successfulUrls = results
        .filter(result => result.success)
        .map(result => result.url)

      if (successfulUrls.length > 0) {
        const currentFiles = editingQuestion[type] || []
        const newFiles = [...currentFiles, ...successfulUrls]
        handleInputChange(type, newFiles)
      }
    } catch (error) {
      console.error('文件上传失败:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = (type: 'images' | 'videos' | 'audios', index: number) => {
    const files = editingQuestion[type]?.filter((_, i) => i !== index) || []
    handleInputChange(type, files)
  }

  const getQuestionTypeLabel = (type: QuestionType) => {
    const typeMap = {
      [QuestionType.choice]: '选择题',
      [QuestionType.qa]: '问答题',
      [QuestionType.judge]: '判断题'
    }
    return typeMap[type] || type
  }

  const getFileIcon = (type: 'images' | 'videos' | 'audios') => {
    switch (type) {
      case 'images': return ImageIcon
      case 'videos': return Video
      case 'audios': return Volume2
      default: return ImageIcon
    }
  }

  const getFileTypeLabel = (type: 'images' | 'videos' | 'audios') => {
    switch (type) {
      case 'images': return '图片'
      case 'videos': return '视频'
      case 'audios': return '音频'
      default: return '文件'
    }
  }

  // 检查是否有媒体文件
  const hasMediaFiles = (editingQuestion.images && editingQuestion.images.length > 0) ||
    (editingQuestion.videos && editingQuestion.videos.length > 0) ||
    (editingQuestion.audios && editingQuestion.audios.length > 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>题目详情</span>
            <Badge variant="outline">{getQuestionTypeLabel(editingQuestion.type)}</Badge>
            <Badge variant="outline">{editingQuestion.subject}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 题目标题 */}
        <div className="space-y-2">
          <Label htmlFor="title">题目标题</Label>
          {enableChange ? (
            <textarea
              id="title"
              value={editingQuestion.title}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('title', e.target.value)}
              placeholder="请输入题目内容..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          ) : (
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
              {editingQuestion.title}
            </p>
          )}
        </div>

        {/* 题目类型 */}
        {enableChange && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">题目类型</Label>
              <Select
                value={editingQuestion.type}
                onValueChange={(value) => handleInputChange('type', value as QuestionType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuestionType.choice}>选择题</SelectItem>
                  <SelectItem value={QuestionType.qa}>问答题</SelectItem>
                  <SelectItem value={QuestionType.judge}>判断题</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">科目</Label>
              <Input
                id="subject"
                value={editingQuestion.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="请输入科目"
              />
            </div>
          </div>
        )}

        {/* 选择题选项 - 只在是选择题且有选项时显示 */}
        {editingQuestion.type === QuestionType.choice && editingQuestion.options && editingQuestion.options.length > 0 && (
          <div className="space-y-2">
            <Label>选项</Label>
            <div className="space-y-2">
              {editingQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-sm font-medium w-6">{String.fromCharCode(65 + index)}.</span>
                  {enableChange ? (
                    <>
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`选项 ${String.fromCharCode(65 + index)}`}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <span className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md flex-1">
                      {option}
                    </span>
                  )}
                </div>
              ))}
              {enableChange && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="w-full"
                >
                  添加选项
                </Button>
              )}
            </div>
          </div>
        )}

        {/* 媒体文件 - 只在有文件时显示 */}
        {hasMediaFiles && (
          (['images', 'videos', 'audios'] as const).map((fileType) => {
            const files = editingQuestion[fileType]
            if (!files || files.length === 0) return null

            return (
              <div key={fileType} className="space-y-2">
                <Label>{getFileTypeLabel(fileType)}</Label>
                <div className="space-y-2">
                  {/* 现有文件列表 */}
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(fileType)({ className: "w-4 h-4" })}
                        <span className="text-sm truncate">{file}</span>
                      </div>
                      {enableChange && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(fileType, index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* 上传按钮 */}
                  {enableChange && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="text-center">
                        <input
                          type="file"
                          multiple
                          accept={fileType === 'images' ? 'image/*' : fileType === 'videos' ? 'video/*' : 'audio/*'}
                          onChange={(e) => handleFileUpload(e, fileType)}
                          className="hidden"
                          id={`${fileType}-upload`}
                        />
                        <label htmlFor={`${fileType}-upload`}>
                          <Button variant="outline" asChild disabled={isUploading}>
                            <span>
                              {isUploading ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                  <span>上传中...</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>上传{getFileTypeLabel(fileType)}</span>
                                </div>
                              )}
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}

        {/* 创建时间 */}
        <div className="text-xs text-gray-500">
          创建时间: {editingQuestion.created_at.toLocaleString()}
          {editingQuestion.updated_at !== editingQuestion.created_at && (
            <span className="ml-4">
              更新时间: {editingQuestion.updated_at.toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

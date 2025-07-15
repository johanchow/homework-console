'use client'

import { useState } from 'react'
import { Button } from '@/component/button'
import { Badge } from '@/component/badge'
import { Upload, Check, X, Loader2, Edit, Trash2, Image, FileText, Music, Video } from 'lucide-react'
import { Question, QuestionType } from '@/entity/question'
import { uploadFile } from '@/api/axios/cos'
import { Input } from '@/component/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/select'
import { QuestionShow } from './QuestionShow'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/component/dialog'

interface QuestionFromImportProps {
  onQuestionSelected: (question: Question) => void
}

interface UploadedImage {
  file: File
  preview: string
  url?: string
  isUploading: boolean
  uploadSuccess: boolean
  uploadError?: string
}

export function QuestionFromImport({ onQuestionSelected }: QuestionFromImportProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null)
  const [questionTitle, setQuestionTitle] = useState('')
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.choice)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    files.forEach(async (file) => {
      // 生成预览
      const reader = new FileReader()
      reader.onload = (e) => {
        const preview = e.target?.result as string

        // 添加到列表，标记为上传中
        const newImage: UploadedImage = {
          file,
          preview,
          isUploading: true,
          uploadSuccess: false
        }

        setUploadedImages(prev => {
          const newList = [...prev, newImage]
          // 立即开始上传
          handleUploadSingleImage(newImage, newList.length - 1)
          return newList
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleUploadSingleImage = async (image: UploadedImage, index: number) => {
    try {
      const result = await uploadFile(image.file)

      setUploadedImages(prev => prev.map((img, i) => {
        if (i === index) {
          return {
            ...img,
            isUploading: false,
            uploadSuccess: result.success,
            url: result.success ? result.url : undefined,
            uploadError: result.success ? undefined : '上传失败'
          }
        }
        return img
      }))
    } catch (error) {
      setUploadedImages(prev => prev.map((img, i) => {
        if (i === index) {
          return {
            ...img,
            isUploading: false,
            uploadSuccess: false,
            uploadError: '上传失败'
          }
        }
        return img
      }))
    }
  }

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSelectQuestion = (question: Question) => {
    setCurrentQuestion(question)
  }

  const handlePreview = () => {
    if (currentQuestion) {
      setShowPreviewDialog(true)
    }
  }

  const handleConfirm = () => {
    if (currentQuestion) {
      // 更新题目的标题和类型
      const updatedQuestion: Question = {
        ...currentQuestion,
        title: questionTitle || currentQuestion.title,
        type: questionType
      }
      onQuestionSelected(updatedQuestion)
    }
  }

  const getQuestionTypeLabel = (type: QuestionType) => {
    const typeMap: Record<QuestionType, string> = {
      [QuestionType.choice]: '选择题',
      [QuestionType.qa]: '问答题',
      [QuestionType.judge]: '判断题',
      [QuestionType.reading]: '阅读题',
      [QuestionType.summary]: '总结题',
      [QuestionType.show]: '展示题'
    }
    return typeMap[type] || type
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4 text-blue-500" />
    } else if (file.type.startsWith('video/')) {
      return <Video className="w-4 h-4 text-purple-500" />
    } else if (file.type.startsWith('audio/')) {
      return <Music className="w-4 h-4 text-green-500" />
    } else {
      return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const successCount = uploadedImages.filter(img => img.uploadSuccess && img.url).length

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Upload className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">智能导入题目</h3>
      </div>

      <div className='flex items-center space-x-4'>
        <Input
          placeholder='请输入题目名称'
          value={questionTitle}
          onChange={(e) => setQuestionTitle(e.target.value)}
          className='flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        />
        <Select value={questionType} onValueChange={(value) => setQuestionType(value as QuestionType)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="选择题目类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={QuestionType.choice}>选择题</SelectItem>
            <SelectItem value={QuestionType.qa}>问答题</SelectItem>
            <SelectItem value={QuestionType.judge}>判断题</SelectItem>
            <SelectItem value={QuestionType.reading}>阅读题</SelectItem>
            <SelectItem value={QuestionType.summary}>总结题</SelectItem>
            <SelectItem value={QuestionType.show}>展示题</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-1 cursor-pointer">
          <div className="text-center">
            <label htmlFor="image-upload">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                支持 JPG、PNG、PDF 格式，可上传多个文件
              </p>
            </label>
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,application/pdf,
                  application/vnd.ms-powerpoint,
                  application/vnd.openxmlformats-officedocument.presentationml.presentation,
                  application/msword,
                  application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
          </div>
        </div>

        {/* 上传成功的文件列表 */}
        {uploadedImages.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">已上传文件 ({uploadedImages.length})</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {uploadedImages.map((image, index) => (
                <div key={index} className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg border">
                  <div className="relative">
                    {image.isUploading ? (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : image.uploadSuccess ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {getFileIcon(image.file)}
                  <span className="text-sm font-medium max-w-32 truncate">{image.file.name}</span>
                  {image.uploadError && (
                    <span className="text-xs text-red-500">{image.uploadError}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-red-50 ml-1"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className='w-32'
            onClick={handlePreview}
            disabled={!currentQuestion}
          >
            预览
          </Button>
          <Button
            variant="outline"
            className='w-32'
            onClick={handleConfirm}
            disabled={!currentQuestion}
          >
            确定
          </Button>
        </div>
      </div>

      {/* 预览模态框 */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>题目预览</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentQuestion && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline">{getQuestionTypeLabel(currentQuestion.type)}</Badge>
                  <span className="text-sm text-gray-500">题目预览</span>
                </div>
                <QuestionShow
                  question={currentQuestion}
                  enableChange={false}
                  onChange={() => { }}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/component/button'
import { Badge } from '@/component/badge'
import { Upload, Check, X, Loader2, Image, FileText, Music, Video } from 'lucide-react'
import { Question, QuestionType } from '@/entity/question'
import { uploadFile } from '@/api/axios/cos'
import { Input } from '@/component/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/select'
import { QuestionShow } from './QuestionShow'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/component/dialog'

interface QuestionFromImportProps {
  onQuestionSelected: (question: Question) => void
}

interface UploadedFile {
  file: File
  preview: string
  url?: string
  isUploading: boolean
  uploadSuccess: boolean
  uploadError?: string
}

interface FormData {
  title: string
  type: QuestionType
}

export function QuestionFromImport({ onQuestionSelected }: QuestionFromImportProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question> | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      type: QuestionType.choice
    }
  })

  const watchedType = watch('type')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    files.forEach(async (file) => {
      // 生成预览
      const reader = new FileReader()
      reader.onload = (e) => {
        const preview = e.target?.result as string

        // 添加到列表，标记为上传中
        const newFile: UploadedFile = {
          file,
          preview,
          isUploading: true,
          uploadSuccess: false
        }

        setUploadedFiles(prev => {
          const newList = [...prev, newFile]
          // 立即开始上传
          handleUploadSingleFile(newFile, newList.length - 1)
          return newList
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleUploadSingleFile = async (file: UploadedFile, index: number) => {
    try {
      const result = await uploadFile(file.file)

      setUploadedFiles(prev => prev.map((f, i) => {
        if (i === index) {
          return {
            ...f,
            isUploading: false,
            uploadSuccess: result.success,
            url: result.success ? result.url : undefined,
            uploadError: result.success ? undefined : '上传失败'
          }
        }
        return f
      }))

      // 如果上传成功，更新 currentQuestion
      if (result.success) {
        updateCurrentQuestionWithFile(file.file, result.url!)
      }
    } catch (error) {
      setUploadedFiles(prev => prev.map((f, i) => {
        if (i === index) {
          return {
            ...f,
            isUploading: false,
            uploadSuccess: false,
            uploadError: '上传失败'
          }
        }
        return f
      }))
    }
  }

  const updateCurrentQuestionWithFile = (file: File, url: string) => {
    setCurrentQuestion(prev => {
      const updated = { ...prev } as Partial<Question>

      if (file.type.startsWith('image/')) {
        updated.images = [...(updated.images || []), url]
      } else if (file.type.startsWith('video/')) {
        updated.videos = [...(updated.videos || []), url]
      } else if (file.type.startsWith('audio/')) {
        updated.audios = [...(updated.audios || []), url]
      }

      return updated
    })
  }

  const handleRemoveFile = (index: number) => {
    const fileToRemove = uploadedFiles[index]
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))

    // 从 currentQuestion 中移除对应的文件
    if (fileToRemove.uploadSuccess && fileToRemove.url) {
      setCurrentQuestion(prev => {
        const updated = { ...prev } as Partial<Question>

        if (fileToRemove.file.type.startsWith('image/')) {
          updated.images = updated.images?.filter(url => url !== fileToRemove.url) || []
        } else if (fileToRemove.file.type.startsWith('video/')) {
          updated.videos = updated.videos?.filter(url => url !== fileToRemove.url) || []
        } else if (fileToRemove.file.type.startsWith('audio/')) {
          updated.audios = updated.audios?.filter(url => url !== fileToRemove.url) || []
        }

        return updated
      })
    }
  }

  const handlePreview = handleSubmit(() => {
    const formData = watch()
    const files = uploadedFiles.filter(f => f.uploadSuccess && f.url)
    setCurrentQuestion(prev => ({
      ...prev,
      // 图片类的
      images: files.filter(f => f.file.type.startsWith('image/')).map(f => f.url!),
      // 文档类的文件，作为附件
      attachments: files.filter(f => f.file.type.startsWith('application/pdf') || f.file.type.startsWith('application/vnd.ms-powerpoint') || f.file.type.startsWith('application/vnd.openxmlformats-officedocument.presentationml.presentation')).map(f => f.url!),
      // 音频
      audios: files.filter(f => f.file.type.startsWith('audio/')).map(f => f.url!),
      // 视频
      videos: files.filter(f => f.file.type.startsWith('video/')).map(f => f.url!),
      title: formData.title,
      type: formData.type
    }))
    setShowPreviewDialog(true)
  })

  const handleConfirm = () => {
    if (currentQuestion && currentQuestion.title && currentQuestion.type) {
      const completeQuestion: Question = {
        id: uuidv4(),
        title: currentQuestion.title,
        type: currentQuestion.type,
        subject: currentQuestion.subject || '',
        options: currentQuestion.options || [],
        images: currentQuestion.images || [],
        videos: currentQuestion.videos || [],
        audios: currentQuestion.audios || [],
        attachments: currentQuestion.attachments || [],
        answer: currentQuestion.answer || '',
        creator_id: currentQuestion.creator_id || '',
        created_at: currentQuestion.created_at || new Date(),
        updated_at: currentQuestion.updated_at || new Date()
      }
      onQuestionSelected(completeQuestion)
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

  const successCount = uploadedFiles.filter(f => f.uploadSuccess && f.url).length

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Upload className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">智能导入题目</h3>
      </div>

      <form className='flex items-center space-x-4'>
        <div className="flex-1">
          <Input
            placeholder='请输入题目名称'
            {...register('title', { required: '题目名称是必填项' })}
            className={`rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.title ? 'border-red-500' : ''
              }`}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>
        <div className="w-48">
          <Select
            value={watchedType}
            onValueChange={(value) => setValue('type', value as QuestionType)}
          >
            <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
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
          {errors.type && (
            <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
          )}
        </div>
      </form>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-1 cursor-pointer">
          <div className="text-center">
            <label htmlFor="image-upload">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                支持 JPG、PNG、PDF、视频、音频格式，可上传多个文件
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
              onChange={handleFileUpload}
              className="hidden"
              id="image-upload"
            />
          </div>
        </div>

        {/* 上传成功的文件列表 */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">已上传文件 ({uploadedFiles.length})</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg border">
                  <div className="relative">
                    {file.isUploading ? (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : file.uploadSuccess ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {getFileIcon(file.file)}
                  <span className="text-sm font-medium max-w-32 truncate">{file.file.name}</span>
                  {file.uploadError && (
                    <span className="text-xs text-red-500">{file.uploadError}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-red-50 ml-1"
                    onClick={() => handleRemoveFile(index)}
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
          >
            预览
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
            {currentQuestion && currentQuestion.type && (
              <div className="border rounded-lg p-2 bg-gray-50 min-h-[200px]">
                <QuestionShow
                  question={currentQuestion as Question}
                  enableChange={false}
                  onChange={() => { }}
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowPreviewDialog(false)}
            >
              返回修改
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!currentQuestion?.title || !currentQuestion?.type}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

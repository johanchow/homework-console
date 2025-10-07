'use client'

import { useState } from 'react'
import { Button } from '@/component/button'
import { Upload, Check, X, Loader2, Image, FileText, Music, Video } from 'lucide-react'
import { Question, QuestionType, QuestionSubject } from '@/entity/question'
import { QuestionShowEdit } from './QuestionShowEdit'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/component/dialog'
import { UploadedFile, handleFileUploadEvent, getFileType } from '@/util/file'
import { parseQuestionFromImages } from '@/api/axios/question'
import { Label } from '@/component/label'

interface QuestionFromBatchProps {
  onQuestionSelected: (questions: Question[]) => void
}

export function QuestionFromBatch({ onQuestionSelected }: QuestionFromBatchProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [batchQuestions, setBatchQuestions] = useState<Question[]>([])
  const [textInput, setTextInput] = useState('')

  // 通用文件处理函数
  const processFiles = async (files: File[]) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // 生成预览
      const reader = new FileReader()
      const preview = await new Promise<string>((resolve) => {
        reader.onload = (e) => {
          resolve(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      })

      // 创建上传文件对象
      const uploadedFile: UploadedFile = {
        file,
        preview,
        isUploading: true,
        uploadSuccess: false,
      }

      // 添加到列表
      setUploadedFiles(prev => [...prev, uploadedFile])

      // 开始上传
      const { uploadFile } = await import('@/api/axios/cos')
      try {
        const result = await uploadFile(file)

        // 更新上传状态
        setUploadedFiles(prev => prev.map((f) => {
          if (f.file === file) {
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
      } catch (error) {
        setUploadedFiles(prev => prev.map((f) => {
          if (f.file === file) {
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
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    await processFiles(files)
    // 清空 input 值，允许重复上传同一文件
    event.target.value = ''
  }

  // 处理粘贴事件
  const handlePaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault()
    const items = event.clipboardData?.items
    if (!items) return

    const files: File[] = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      // 检查是否为图片类型
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          files.push(file)
        }
      }
    }

    if (files.length > 0) {
      await processFiles(files)
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handlePreview = async () => {
    const successFileUrls = uploadedFiles.filter(f => f.uploadSuccess && f.url)

    if (successFileUrls.length === 0 && !textInput.trim()) {
      alert('请先上传文件或输入文本内容')
      return
    }

    // 使用同一个API处理图片和文本
    const { questions } = await parseQuestionFromImages({
      image_urls: successFileUrls.length > 0 ? successFileUrls.map(f => f.url!) : undefined,
      text: textInput.trim() || undefined
    })

    setBatchQuestions(questions as unknown as Question[])
    setShowPreviewDialog(true)
  }

  const handleConfirm = () => {
    if (batchQuestions.length > 0) {
      onQuestionSelected(batchQuestions)
      setShowPreviewDialog(false)
      // 清空状态
      setUploadedFiles([])
      setBatchQuestions([])
      setTextInput('')
    }
  }

  const getFileIcon = (file: File) => {
    const fileType = getFileType(file)
    switch (fileType) {
      case 'image':
        return <Image className="w-4 h-4 text-blue-500" />
      case 'video':
        return <Video className="w-4 h-4 text-purple-500" />
      case 'audio':
        return <Music className="w-4 h-4 text-green-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const successCount = uploadedFiles.filter(f => f.uploadSuccess && f.url).length

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* 文本输入区域 */}
        <div className="space-y-2">
          <Label htmlFor="text-input">文本输入</Label>
          <textarea
            id="text-input"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="请输入或粘贴题目文本内容，系统自动解析为题目"
            rows={6}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          />
        </div>

        {/* 文件上传区域 */}
        <div className="space-y-2">
          <Label>文件上传</Label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer focus-within:border-blue-400 transition-colors"
            tabIndex={0}
            onPaste={handlePaste}
          >
            <div className="text-center">
              <label htmlFor="batch-file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  支持 JPG、PNG、PDF、TXT格式，可上传多个文件
                </p>
                <p className="text-xs text-gray-500">
                  点击选择文件或按 Ctrl+V 粘贴截图
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
                id="batch-file-upload"
              />
            </div>
          </div>
        </div>

        {/* 上传成功的文件列表 */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">已上传文件 ({uploadedFiles.length})</h4>
              <span className="text-sm text-gray-500">
                成功: {successCount} / {uploadedFiles.length}
              </span>
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
            className='min-w-32'
            onClick={handlePreview}
            disabled={successCount === 0 && !textInput.trim()}
          >
            预览 {textInput.trim() && successCount === 0 ? '(文本)' : successCount > 0 && !textInput.trim() ? `(${successCount})` : textInput.trim() && successCount > 0 ? `(文本+${successCount}个文件)` : ''}
          </Button>
        </div>
      </div>

      {/* 预览模态框 */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>批量题目预览 ({batchQuestions.length} 个题目)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {batchQuestions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-gray-600">题目 {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setBatchQuestions(prev => prev.filter((_, i) => i !== index))
                    }}
                    className="h-6 w-6 p-0 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                <div className="min-h-[150px]">
                  <QuestionShowEdit
                    question={question}
                    onChange={(newQuestion) => {
                      setBatchQuestions(prev => prev.map((q, i) => i === index ? q : newQuestion))
                    }}
                  />
                </div>
              </div>
            ))}
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
              disabled={batchQuestions.length === 0}
            >
              确定导入 ({batchQuestions.length} 个题目)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

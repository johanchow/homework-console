'use client'

import { useState } from 'react'
import { Button } from '@/component/button'
import { Upload, Check, X, Loader2, Image, FileText, Music, Video } from 'lucide-react'
import { Question, QuestionType, QuestionSubject } from '@/entity/question'
import { QuestionShow } from './QuestionShow'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/component/dialog'
import { newUuid } from '@/util'
import { UploadedFile, handleFileUploadEvent, getFileType } from '@/util/file'

interface QuestionFromBatchProps {
  onQuestionSelected: (questions: Question[]) => void
}

export function QuestionFromBatch({ onQuestionSelected }: QuestionFromBatchProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [batchQuestions, setBatchQuestions] = useState<Question[]>([])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await handleFileUploadEvent(
      event,
      (file: UploadedFile, index: number) => {
        setUploadedFiles(prev => [...prev, file])
      },
      (index: number, result) => {
        setUploadedFiles(prev => prev.map((f, i) => {
          if (i === index) {
            return {
              ...f,
              isUploading: false,
              uploadSuccess: result.success,
              url: result.success ? result.url : undefined,
              uploadError: result.success ? undefined : result.error
            }
          }
          return f
        }))
      }
    )
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handlePreview = () => {
    const successFiles = uploadedFiles.filter(f => f.uploadSuccess && f.url)

    if (successFiles.length === 0) {
      alert('请先上传文件')
      return
    }

    // 为每个文件创建一个问题
    const questions: Question[] = successFiles.map((file, index) => ({
      id: newUuid(),
      title: `批量导入题目 ${index + 1}`,
      type: QuestionType.choice,
      subject: QuestionSubject.chinese,
      tip: '',
      options: [],
      images: file.file.type.startsWith('image/') ? [file.url!] : [],
      videos: file.file.type.startsWith('video/') ? [file.url!] : [],
      audios: file.file.type.startsWith('audio/') ? [file.url!] : [],
      attachments: file.file.type.startsWith('application/') ? [file.url!] : [],
      links: [],
      material: '',
      creator_id: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    setBatchQuestions(questions)
    setShowPreviewDialog(true)
  }

  const handleConfirm = () => {
    if (batchQuestions.length > 0) {
      onQuestionSelected(batchQuestions)
      setShowPreviewDialog(false)
      // 清空状态
      setUploadedFiles([])
      setBatchQuestions([])
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
      <div className="flex items-center space-x-2">
        <Upload className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">批量导入题目</h3>
      </div>



      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-1 cursor-pointer">
          <div className="text-center">
            <label htmlFor="batch-file-upload">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                支持 JPG、PNG、PDF、视频、音频格式，可上传多个文件
              </p>
              <p className="text-xs text-gray-500">
                每个文件将生成一个独立的题目
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
            className='w-32'
            onClick={handlePreview}
            disabled={successCount === 0}
          >
            预览 ({successCount})
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
                </div>
                <div className="min-h-[150px]">
                  <QuestionShow
                    question={question}
                    isPreview={true}
                    onChange={() => { }} // 批量模式下不允许编辑
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

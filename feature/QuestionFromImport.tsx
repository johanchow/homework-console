'use client'

import { useState } from 'react'
import { Button } from '@/component/button'
import { Badge } from '@/component/badge'
import { Upload, Check, X, Loader2, Edit, Trash2 } from 'lucide-react'
import { Question, QuestionType } from '@/entity/question'
import { uploadFile } from '@/api/axios/cos'
import { parseQuestionFromImages } from '@/api/axios/question'
import { QuestionShow } from './QuestionShow'

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
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([])
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    files.forEach(async (file) => {
      if (file.type.startsWith('image/')) {
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
      }
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

  const handleProcessImages = async () => {
    const successImages = uploadedImages.filter(img => img.uploadSuccess && img.url)

    if (successImages.length === 0) {
      console.error('没有成功上传的图片')
      return
    }

    setIsProcessing(true)

    try {
      // 调用API解析图片
      const imageUrls = successImages.map(img => img.url!)

      const parseResult = await parseQuestionFromImages({
        image_urls: imageUrls
      })

      // 为解析的题目添加id字段
      const questionsWithId = parseResult.questions.map((question, index) => ({
        ...question,
        id: `parsed-${Date.now()}-${index}`
      }))

      setParsedQuestions(questionsWithId)
      setIsProcessing(false)

    } catch (error) {
      console.error('解析图片失败:', error)
      setIsProcessing(false)
    }
  }

  const handleEditQuestion = (index: number) => {
    setEditingQuestionIndex(index)
  }

  const handleDeleteQuestion = (index: number) => {
    setParsedQuestions(prev => prev.filter((_, i) => i !== index))
  }

  const handleQuestionChange = (updatedQuestion: Question) => {
    if (editingQuestionIndex !== null) {
      setParsedQuestions(prev => prev.map((q, i) =>
        i === editingQuestionIndex ? updatedQuestion : q
      ))
    }
  }

  const handleSelectQuestion = (question: Question) => {
    onQuestionSelected(question)
  }

  const getQuestionTypeLabel = (type: QuestionType) => {
    const typeMap = {
      [QuestionType.choice]: '选择题',
      [QuestionType.qa]: '问答题',
      [QuestionType.judge]: '判断题'
    }
    return typeMap[type] || type
  }

  const successCount = uploadedImages.filter(img => img.uploadSuccess && img.url).length

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Upload className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">智能导入题目</h3>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              支持 JPG、PNG、PDF 格式，可上传多张图片
            </p>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button variant="outline" asChild>
                <span>选择图片</span>
              </Button>
            </label>
          </div>
        </div>

        {uploadedImages.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">已上传图片 ({uploadedImages.length})</h4>
              <Badge variant={successCount > 0 ? "default" : "secondary"}>
                成功: {successCount}
              </Badge>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative border rounded-lg p-1">
                  <div className="aspect-square bg-gray-100 rounded overflow-hidden relative">
                    <img
                      src={image.preview}
                      alt={`图片 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* 上传状态覆盖层 - 只在非成功状态显示 */}
                    {!image.uploadSuccess && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        {image.isUploading ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <X className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                    )}
                    {/* 成功状态指示 - 在右上角显示绿色勾号 */}
                    {image.uploadSuccess && (
                      <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs mt-1 truncate text-center">{image.file.name}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-white border rounded-full shadow-sm hover:bg-red-50"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleProcessImages}
                disabled={isProcessing || successCount === 0}
                className="flex-1"
              >
                {isProcessing ? '解析中...' : `开始解析图片 (${successCount} 张)`}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 解析结果 */}
      {parsedQuestions.length > 0 && (
        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">解析结果</h3>
            <Badge variant="secondary">{parsedQuestions.length} 道题目</Badge>
          </div>

          <div className="space-y-6 max-h-80 overflow-y-auto overscroll-contain">
            {parsedQuestions.map((question, index) => (
              <div key={question.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium">题目 {index + 1}</h4>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditQuestion(index)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQuestion(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <QuestionShow
                  question={question}
                  enableChange={editingQuestionIndex === index}
                  onChange={handleQuestionChange}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/component/dialog'
import { Button } from '@/component/button'
import { Badge } from '@/component/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/component/tabs'
import { Upload, FileText, Image, Check, X, Loader2 } from 'lucide-react'
import { Question, QuestionType } from '@/entity/question'
import { uploadFile } from '@/api/axios/cos'
import { parseQuestionFromImages } from '@/api/axios/question'

interface QuestionFromImportProps {
  onQuestionSelected: (question: Question) => void
  children: React.ReactNode
}

interface UploadedImage {
  file: File
  preview: string
  url?: string
  isUploading: boolean
  uploadSuccess: boolean
  uploadError?: string
}

export function QuestionFromImport({ onQuestionSelected, children }: QuestionFromImportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('image')
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [textContent, setTextContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([])

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
      // TODO: 显示错误提示
    }
  }

  const handleProcessText = async () => {
    if (!textContent.trim()) return

    setIsProcessing(true)

    setTimeout(() => {
      const lines = textContent.split('\n').filter(line => line.trim())
      const questionTypes = [QuestionType.choice, QuestionType.qa, QuestionType.judge]
      const newQuestions: Question[] = lines.slice(0, 5).map((line, index) => ({
        id: `text-${Date.now()}-${index}`,
        title: `从文字解析: ${line.substring(0, 50)}...`,
        type: questionTypes[Math.floor(Math.random() * questionTypes.length)],
        subject: '数学',
        creator_id: 'import-system',
        created_at: new Date(),
        updated_at: new Date()
      }))

      setParsedQuestions(newQuestions)
      setIsProcessing(false)
    }, 1500)
  }

  const handleSelectQuestion = (question: Question) => {
    onQuestionSelected(question)
    setIsOpen(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setUploadedImages([])
      setTextContent('')
      setParsedQuestions([])
      setActiveTab('image')
    }
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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            智能导入题目
          </DialogTitle>
          <DialogDescription>
            通过图片或文字智能识别并导入题目
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="image" className="flex items-center">
              <Image className="w-4 h-4 mr-2" />
              图片导入
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              文字导入
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="space-y-6">
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
                  <Button
                    onClick={handleProcessImages}
                    disabled={isProcessing || successCount === 0}
                    className="w-full"
                  >
                    {isProcessing ? '解析中...' : `开始解析图片 (${successCount} 张)`}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">粘贴题目文字</label>
                <textarea
                  placeholder="请粘贴题目文字内容，系统将自动识别并解析题目..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={6}
                  className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <Button
                onClick={handleProcessText}
                disabled={!textContent.trim() || isProcessing}
                className="w-full"
              >
                {isProcessing ? '解析中...' : '开始解析文字'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {parsedQuestions.length > 0 && (
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">解析结果</h3>
              <Badge variant="secondary">{parsedQuestions.length} 道题目</Badge>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto overscroll-contain">
              {parsedQuestions.map((question) => (
                <div key={question.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">{question.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">{getQuestionTypeLabel(question.type)}</Badge>
                      <Badge variant="outline" className="text-xs">{question.subject}</Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSelectQuestion(question)}
                    className="ml-4"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    选取
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

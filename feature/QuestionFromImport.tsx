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
import { Upload, FileText, Image, Check, X } from 'lucide-react'
import { Question, QuestionType } from '@/entity/question'

interface QuestionFromImportProps {
  onQuestionSelected: (question: Question) => void
  children: React.ReactNode
}

export function QuestionFromImport({ onQuestionSelected, children }: QuestionFromImportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('image')
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [textContent, setTextContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedImages(prev => [...prev, ...files])
  }

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleProcessImages = async () => {
    if (uploadedImages.length === 0) return
    
    setIsProcessing(true)
    
    setTimeout(() => {
      const questionTypes = [QuestionType.choice, QuestionType.qa, QuestionType.judge]
      const newQuestions: Question[] = uploadedImages.map((_, index) => ({
        id: `import-${Date.now()}-${index}`,
        title: `从图片 ${index + 1} 解析的题目`,
        type: questionTypes[Math.floor(Math.random() * questionTypes.length)],
        subject: '数学',
        creator_id: 'import-system',
        created_at: new Date(),
        updated_at: new Date()
      }))
      
      setParsedQuestions(newQuestions)
      setIsProcessing(false)
    }, 2000)
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
                  <h4 className="font-medium">已上传图片 ({uploadedImages.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative border rounded-lg p-2">
                        <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-xs mt-1 truncate">{file.name}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={handleProcessImages}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? '解析中...' : '开始解析图片'}
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
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
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

        {parsedQuestions.length === 0 && !isProcessing && (
          <div className="text-center py-8 text-gray-500">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>请上传图片或粘贴文字内容开始智能导入</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

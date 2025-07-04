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
import { Input } from '@/component/input'
import { Label } from '@/component/label'
import { Badge } from '@/component/badge'
import { Bot, RefreshCw, Check } from 'lucide-react'

interface Question {
  id: number
  title: string
  type: string
  difficulty: string
  subject: string
}

interface QuestionFromAIProps {
  onQuestionSelected: (question: Question) => void
  children: React.ReactNode
}

export function QuestionFromAI({ onQuestionSelected, children }: QuestionFromAIProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [count, setCount] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    
    // 模拟AI生成题目
    setTimeout(() => {
      const newQuestions: Question[] = Array.from({ length: count }, (_, index) => ({
        id: Date.now() + index,
        title: `AI生成的题目 ${index + 1}: ${prompt}`,
        type: ['选择题', '填空题', '计算题', '简答题'][Math.floor(Math.random() * 4)],
        difficulty: ['简单', '中等', '困难'][Math.floor(Math.random() * 3)],
        subject: '数学'
      }))
      
      setGeneratedQuestions(newQuestions)
      setIsGenerating(false)
    }, 2000)
  }

  const handleRegenerate = () => {
    if (!prompt.trim()) return
    handleGenerate()
  }

  const handleSelectQuestion = (question: Question) => {
    onQuestionSelected(question)
    setIsOpen(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // 关闭时重置状态
      setPrompt('')
      setCount(5)
      setGeneratedQuestions([])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            AI智能出题
          </DialogTitle>
          <DialogDescription>
            通过AI智能生成符合您学习目标的练习题
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 提示词输入 */}
          <div className="space-y-2">
            <Label htmlFor="prompt">提示词 *</Label>
            <textarea
              id="prompt"
              placeholder="请描述您想要生成的题目类型、难度、知识点等"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* 数量设置 */}
          <div className="space-y-2">
            <Label htmlFor="count">数量</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-32"
            />
          </div>

          {/* 生成按钮 */}
          <div className="flex space-x-4">
            <Button 
              onClick={handleGenerate} 
              disabled={!prompt.trim() || isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 mr-2" />
                  生成
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRegenerate}
              disabled={!prompt.trim() || isGenerating || generatedQuestions.length === 0}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重新生成
            </Button>
          </div>

          {/* 生成的题目列表 */}
          {generatedQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">生成的题目</h3>
                <Badge variant="secondary">{generatedQuestions.length} 道题目</Badge>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {generatedQuestions.map((question) => (
                  <div key={question.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">{question.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">{question.type}</Badge>
                        <Badge variant="outline" className="text-xs">{question.difficulty}</Badge>
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

          {/* 使用提示 */}
          {generatedQuestions.length === 0 && !isGenerating && (
            <div className="text-center py-8 text-gray-500">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>请输入提示词并点击生成按钮开始AI出题</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

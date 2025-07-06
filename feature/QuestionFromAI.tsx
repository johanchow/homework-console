'use client'

import { useState, useRef } from 'react'
import { Bot, RefreshCw, Check, Send, MessageSquare } from 'lucide-react'
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
import { Question, QuestionType } from '@/entity/question'
import { newUuid } from '@/util'
import { generateQuestionsWithPrompt } from '@/api/axios/question'
interface ConversationMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface QuestionFromAIProps {
  onQuestionSelected: (question: Question) => void
  prompt?: string;
  onPromptUpdated?: (prompt: string) => void;
  children: React.ReactNode
}

export function QuestionFromAI({ onQuestionSelected, prompt: outPrompt, onPromptUpdated, children }: QuestionFromAIProps) {
  const isControlled = !!onPromptUpdated;
  const [isOpen, setIsOpen] = useState(false)
  const [internalPrompt, setInternalPrompt] = useState('')
  const [count, setCount] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([])
  const sessionIdRef = useRef<string | null>(null)

  const prompt = isControlled ? (outPrompt || '') : internalPrompt;
  const setPrompt = isControlled ? onPromptUpdated : setInternalPrompt;

  const handleGenerate = async (promptText?: string) => {
    const textToUse = promptText || currentPrompt;
    if (!textToUse.trim()) return

    setIsGenerating(true)

    // 模拟AI生成题目
    let questions: Question[];
    try {
      const resp = await generateQuestionsWithPrompt({
        ai_prompt: textToUse,
        subject: 'chinese',
        count: count,
        session_id: sessionIdRef.current
      })
      questions = resp.questions.map(q => ({
        ...q,
        id: newUuid(),
      }))
      sessionIdRef.current = resp.session_id
    } catch (error) {
      console.error('生成题目失败', error)
      return
    } finally {
      setIsGenerating(false)
    }
    // 添加用户消息到对话历史
    const userMessage: ConversationMessage = {
      id: newUuid(),
      type: 'user',
      content: textToUse,
      timestamp: new Date()
    }
    setCurrentPrompt('') // 清空当前输入框
    setConversation(prev => [...prev, userMessage])
    setCurrentQuestions(questions) // 设置当前题目列表
  }

  const handleRegenerate = () => {
    // 获取最后一条用户消息
    const lastUserMessage = conversation
      .filter(msg => msg.type === 'user')
      .pop()

    if (lastUserMessage) {
      handleGenerate(lastUserMessage.content)
    }
  }

  const handleSelectQuestion = (question: Question) => {
    onQuestionSelected(question)
    setIsOpen(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // 关闭时重置状态
      setCurrentPrompt('')
      setCount(5)
      setConversation([])
      setCurrentQuestions([])
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 只获取用户消息用于显示
  const userMessages = conversation.filter(msg => msg.type === 'user')

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            AI智能出题
          </DialogTitle>
          <DialogDescription>
            通过多轮对话，AI智能生成符合您学习目标的练习题
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4">
          {/* 对话历史区域 - 大幅缩小高度 */}
          <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
            {userMessages.length === 0 && !isGenerating && (
              <div className="text-center py-2 text-gray-500 text-sm">
                <p>开始与AI对话，描述您想要生成的题目</p>
              </div>
            )}

            {userMessages.map((message) => (
              <div key={message.id} className="flex justify-end">
                <div className="bg-blue-500 text-white text-sm rounded-lg px-3 py-1.5 max-w-[80%] break-words">
                  {message.content}
                </div>
              </div>
            ))}

            {/* 生成中状态 */}
            {isGenerating && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>AI正在生成题目...</span>
              </div>
            )}
          </div>

          {/* 输入区域 */}
          <div className="border-t pt-4 space-y-4">
            {/* 输入控件 - 全部放在同一行 */}
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <textarea
                  placeholder="描述您想要生成的题目类型、难度、知识点等..."
                  value={currentPrompt}
                  onChange={(e) => setCurrentPrompt(e.target.value)}
                  rows={1}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="count" className="text-sm whitespace-nowrap">数量：</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="20"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  className="w-16"
                />
              </div>

              <Button
                onClick={() => handleGenerate()}
                disabled={!currentPrompt.trim() || isGenerating}
                size="sm"
                className="px-4"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={isGenerating || userMessages.length === 0}
                size="sm"
                className="px-4"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* 生成的题目列表 */}
            {currentQuestions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">生成的题目</h3>
                  <Badge variant="secondary">{currentQuestions.length} 道题目</Badge>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto overscroll-contain">
                  {currentQuestions.map((question) => (
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

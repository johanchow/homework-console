'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/component/tabs'
import { Upload, Bot } from 'lucide-react'
import { QuestionFromAI } from './QuestionFromAI'
import { QuestionFromInput } from './QuestionFromInput'
import { QuestionFromBatch } from './QuestionFromBatch'
import { Question } from '@/entity/question'

interface QuestionAddingProps {
  currentQuestions: Question[];
  onQuestionsUpdated: (questions: Question[]) => void
  prompt?: string;
  onPromptUpdated?: (prompt: string) => void;
}

export function QuestionAdding({ currentQuestions, onQuestionsUpdated, prompt, onPromptUpdated }: QuestionAddingProps) {
  const handleAIQuestionSelected = (question: Question) => {
    onQuestionsUpdated([...currentQuestions, question])
  }

  const handleImportQuestionSelected = (question: Question) => {
    onQuestionsUpdated([...currentQuestions, question])
  }

  const handleBatchQuestionSelected = (batchQuestions: Question[]) => {
    onQuestionsUpdated([...currentQuestions, ...batchQuestions])
  }

  return (
    <div className="space-y-6">
      {/* 添加题目 - Tab形式 */}
      <Card>
        <CardHeader>
          <CardTitle>添加题目</CardTitle>
          <CardDescription>
            通过AI生成或导入方式添加新题目
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="import" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="import" className="flex items-center">
                <Upload className="w-3 h-4 mr-1" />
                智能录入
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex items-center">
                <Upload className="w-3 h-4 mr-1" />
                批量导入
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center">
                <Bot className="w-3 h-3 mr-1" />
                AI出题
              </TabsTrigger>
            </TabsList>

            {/* AI出题Tab */}
            <TabsContent value="ai" className="space-y-6">
              <QuestionFromAI
                onQuestionSelected={handleAIQuestionSelected}
                prompt={prompt}
                onPromptUpdated={onPromptUpdated}
              />
            </TabsContent>

            <TabsContent value="batch" className="space-y-6">
              <QuestionFromBatch
                onQuestionSelected={handleBatchQuestionSelected}
              />
            </TabsContent>

            {/* 智能录入Tab */}
            <TabsContent value="import" className="space-y-6">
              <QuestionFromInput
                onQuestionSelected={handleImportQuestionSelected}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div >
  )
}

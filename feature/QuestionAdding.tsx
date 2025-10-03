'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { QuestionFromBatch } from './QuestionFromBatch'
import { Question } from '@/entity/question'

interface QuestionAddingProps {
  currentQuestions: Question[];
  onQuestionsUpdated: (questions: Question[]) => void
  prompt?: string;
}

export function QuestionAdding({ currentQuestions, onQuestionsUpdated, prompt }: QuestionAddingProps) {

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
            通过复制文字或者上传图片、文件导入题目
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionFromBatch
            onQuestionSelected={handleBatchQuestionSelected}
          />
        </CardContent>
      </Card>
    </div >
  )
}

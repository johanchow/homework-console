'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/component/dialog'
import { Button } from '@/component/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/component/card'
import { Badge } from '@/component/badge'
import { Checkbox } from '@/component/checkbox'
import { Input } from '@/component/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/select'
import { Filter, X } from 'lucide-react'
import { listQuestions } from '@/api/axios/question'
import { QuestionType, QuestionSubject, questionTypeLabel, questionTypeIcon, questionSubjectLabel } from '@/entity/question'
import { toast } from 'sonner'

interface QuestionImportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (questionIds: string[]) => Promise<void>
  existingQuestionIds?: string[]
}

export function QuestionImport({ open, onOpenChange, onImport, existingQuestionIds = [] }: QuestionImportProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [filters, setFilters] = useState<Record<string, string | undefined>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['questions', filters],
    queryFn: () => listQuestions(filters, { page: 1, page_size: 100 }),
    staleTime: 2 * 60 * 1000,
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const handleSelectAll = () => {
    if (!data?.questions) return

    const availableQuestions = data.questions.filter(q => !existingQuestionIds.includes(q.id))
    const allAvailableIds = availableQuestions.map(q => q.id)

    if (selectedQuestions.length === allAvailableIds.length) {
      setSelectedQuestions([])
    } else {
      setSelectedQuestions(allAvailableIds)
    }
  }

  const handleImport = async () => {
    if (selectedQuestions.length === 0) {
      toast.error('请选择要导入的题目')
      return
    }

    await onImport(selectedQuestions)
    setSelectedQuestions([])
    onOpenChange(false)
    toast.success(`已导入 ${selectedQuestions.length} 道题目`)
  }



  const availableQuestions = data?.questions?.filter(q => !existingQuestionIds.includes(q.id)) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>导入题目</DialogTitle>
          <DialogDescription>
            从已有题目中选择要导入到考试中的题目
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* 过滤栏 */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <Filter className="w-4 h-4 mr-2" />
                筛选条件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">题目标题</label>
                  <Input
                    placeholder="搜索题目标题"
                    value={filters.title || ''}
                    onChange={(e) => handleFilterChange('title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">科目</label>
                  <Select
                    value={filters.subject || 'all'}
                    onValueChange={(value) => handleFilterChange('subject', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择科目" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部科目</SelectItem>
                      {Object.values(QuestionSubject).map(subject => (
                        <SelectItem key={subject} value={subject}>
                          {questionSubjectLabel[subject]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">类型</label>
                  <Select
                    value={filters.type || 'all'}
                    onValueChange={(value) => handleFilterChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      {Object.values(QuestionType).map(type => (
                        <SelectItem key={type} value={type}>
                          {questionTypeLabel[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    清除过滤
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 题目列表 */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">加载中...</p>
              </div>
            ) : availableQuestions.length > 0 ? (
              <div className="space-y-2">
                {/* 全选按钮 */}
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <Checkbox
                    checked={selectedQuestions.length === availableQuestions.length && availableQuestions.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">
                    全选 ({selectedQuestions.length}/{availableQuestions.length})
                  </span>
                </div>

                {/* 题目列表 */}
                {availableQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={selectedQuestions.includes(question.id)}
                      onCheckedChange={() => handleQuestionToggle(question.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{questionTypeIcon[question.type]}</span>
                        <Badge variant="outline" className="text-xs">
                          {questionSubjectLabel[question.subject as QuestionSubject]}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {questionTypeLabel[question.type]}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {question.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>暂无可用题目</p>
                {(filters.title || filters.subject || filters.type) && (
                  <p className="mt-2">尝试调整搜索条件</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            已选择 {selectedQuestions.length} 道题目
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedQuestions.length === 0}
            >
              导入选中题目 ({selectedQuestions.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


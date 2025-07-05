'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/card'
import { Button } from '@/component/button'
import { Input } from '@/component/input'
import { Badge } from '@/component/badge'
import { Search, Edit, Trash2, Image, Video, Volume2 } from 'lucide-react'
import { Question, QuestionType } from '@/entity/question'
import { QuestionAdding } from '@/feature/QuestionAdding'
import { QuestionEditModal } from '@/feature/QuestionEditModal'

// 模拟数据
const mockQuestions: Question[] = [
  {
    id: '1',
    subject: '数学',
    type: QuestionType.choice,
    title: '求函数 f(x) = x² + 2x + 1 的导数',
    options: ['2x + 2', '2x + 1', 'x + 2', 'x + 1'],
    answer: '2x + 2',
    creator_id: 'teacher-001',
    created_at: new Date('2024-01-15T10:00:00Z'),
    updated_at: new Date('2024-01-20T14:20:00Z'),
    images: ['image1.jpg', 'image2.png'],
    videos: ['video1.mp4'],
    audios: []
  },
  {
    id: '2',
    subject: '数学',
    type: QuestionType.qa,
    title: '解释什么是微积分的基本定理，并说明其在数学中的重要性',
    answer: '微积分基本定理建立了微分和积分之间的关系...',
    creator_id: 'teacher-001',
    created_at: new Date('2024-01-15T10:30:00Z'),
    updated_at: new Date('2024-01-19T16:45:00Z'),
    images: [],
    videos: [],
    audios: ['audio1.mp3', 'audio2.wav']
  },
  {
    id: '3',
    subject: '数学',
    type: QuestionType.judge,
    title: '导数的几何意义是函数图像在某点的切线斜率',
    answer: '正确',
    creator_id: 'teacher-001',
    created_at: new Date('2024-01-15T11:00:00Z'),
    updated_at: new Date('2024-01-18T11:30:00Z'),
    images: ['image3.jpg'],
    videos: [],
    audios: []
  },
  {
    id: '4',
    subject: '英语',
    type: QuestionType.choice,
    title: 'Choose the correct form of the verb: "She _____ to the store yesterday."',
    options: ['go', 'goes', 'went', 'going'],
    answer: 'went',
    creator_id: 'teacher-002',
    created_at: new Date('2024-01-16T09:00:00Z'),
    updated_at: new Date('2024-01-17T15:20:00Z'),
    images: [],
    videos: ['video2.mp4'],
    audios: ['audio3.mp3']
  },
  {
    id: '5',
    subject: '计算机科学',
    type: QuestionType.qa,
    title: '什么是数据结构？请举例说明几种常见的数据结构',
    answer: '数据结构是计算机存储、组织数据的方式...',
    creator_id: 'teacher-003',
    created_at: new Date('2024-01-16T14:00:00Z'),
    updated_at: new Date('2024-01-16T14:00:00Z'),
    images: ['image4.png', 'image5.jpg'],
    videos: [],
    audios: []
  }
]

export default function QuestionListPage() {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions)
  const [searchTitle, setSearchTitle] = useState('')

  // 过滤题目
  const filteredQuestions = useMemo(() => {
    return questions.filter(question =>
      question.title.toLowerCase().includes(searchTitle.toLowerCase())
    )
  }, [questions, searchTitle])

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId))
  }

  const handleSaveQuestion = (updatedQuestion: Question) => {
    setQuestions(prev => 
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    )
  }

  const handleQuestionsUpdated = (newQuestions: Question[]) => {
    setQuestions(prev => [...prev, ...newQuestions])
  }

  const getQuestionTypeLabel = (type: QuestionType) => {
    const typeMap = {
      [QuestionType.choice]: '选择题',
      [QuestionType.qa]: '问答题',
      [QuestionType.judge]: '判断题'
    }
    return typeMap[type] || type
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateTitle = (title: string, maxLength: number = 50) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title
  }

  const getMediaInfo = (question: Question) => {
    const parts = []
    if (question.images && question.images.length > 0) {
      parts.push(`${question.images.length}个图片`)
    }
    if (question.videos && question.videos.length > 0) {
      parts.push(`${question.videos.length}个视频`)
    }
    if (question.audios && question.audios.length > 0) {
      parts.push(`${question.audios.length}个音频`)
    }
    return parts.join('、') || '-'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">题目管理</h1>
          <p className="text-gray-600 mt-2">管理和组织您的题目库</p>
        </div>

        {/* 搜索过滤 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索题目标题..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* 题目列表 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>题目列表</span>
              <Badge variant="secondary">{filteredQuestions.length} 道题</Badge>
            </CardTitle>
            <CardDescription>
              查看和管理所有题目
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredQuestions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">题目</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">科目</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">类型</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">媒体</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">更新时间</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((question) => (
                      <tr key={question.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="max-w-xs">
                            <p className="font-medium text-gray-900">
                              {truncateTitle(question.title)}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{question.subject}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary">{getQuestionTypeLabel(question.type)}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            {question.images && question.images.length > 0 && (
                              <div className="flex items-center">
                                <Image className="w-3 h-3 mr-1" />
                                <span>{question.images.length}</span>
                              </div>
                            )}
                            {question.videos && question.videos.length > 0 && (
                              <div className="flex items-center">
                                <Video className="w-3 h-3 mr-1" />
                                <span>{question.videos.length}</span>
                              </div>
                            )}
                            {question.audios && question.audios.length > 0 && (
                              <div className="flex items-center">
                                <Volume2 className="w-3 h-3 mr-1" />
                                <span>{question.audios.length}</span>
                              </div>
                            )}
                            {(!question.images || question.images.length === 0) &&
                             (!question.videos || question.videos.length === 0) &&
                             (!question.audios || question.audios.length === 0) && (
                              <span>-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatDate(question.updated_at)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <QuestionEditModal 
                              question={question} 
                              onSave={handleSaveQuestion}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </QuestionEditModal>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>暂无题目数据</p>
                {searchTitle && <p className="mt-2">尝试调整搜索条件</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 添加题目 */}
        <QuestionAdding 
          currentQuestions={[]} 
          onQuestionsUpdated={handleQuestionsUpdated} 
        />
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Button } from '@/component/button'
import { Input } from '@/component/input'
import { Label } from '@/component/label'
import { Badge } from '@/component/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/select'
import { Upload, X, Image as ImageIcon, Video, Volume2, Trash2, Play, Pause } from 'lucide-react'
import { Question, QuestionType } from '@/entity/question'

interface QuestionShowProps {
  question: Question
  enableChange?: boolean
  onChange?: (question: Question) => void
}

export function QuestionShow({ question, enableChange = false, onChange }: QuestionShowProps) {
  const [editingQuestion, setEditingQuestion] = useState<Question>(question)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  const handleInputChange = (field: keyof Question, value: any) => {
    const updatedQuestion = {
      ...editingQuestion,
      [field]: value,
      updated_at: new Date()
    }
    setEditingQuestion(updatedQuestion)
    onChange?.(updatedQuestion)
  }

  const handleOptionChange = (index: number, value: string) => {
    const options = [...(editingQuestion.options || [])]
    options[index] = value
    handleInputChange('options', options)
  }

  const handleAddOption = () => {
    const options = [...(editingQuestion.options || []), '']
    handleInputChange('options', options)
  }

  const handleRemoveOption = (index: number) => {
    const options = editingQuestion.options?.filter((_, i) => i !== index) || []
    handleInputChange('options', options)
  }

  const handleRemoveFile = (type: 'images' | 'videos' | 'audios', index: number) => {
    const files = editingQuestion[type]?.filter((_, i) => i !== index) || []
    handleInputChange(type, files)
  }

  const handleAudioPlay = (url: string) => {
    if (playingAudio === url) {
      setPlayingAudio(null)
    } else {
      setPlayingAudio(url)
    }
  }

  const handleVideoPlay = (url: string) => {
    if (playingVideo === url) {
      setPlayingVideo(null)
    } else {
      setPlayingVideo(url)
    }
  }

  const getQuestionTypeLabel = (type: QuestionType) => {
    const typeMap: Record<QuestionType, string> = {
      [QuestionType.choice]: '选择题',
      [QuestionType.qa]: '问答题',
      [QuestionType.judge]: '判断题',
      [QuestionType.reading]: '阅读题',
      [QuestionType.summary]: '总结题',
      [QuestionType.show]: '展示题'
    }
    return typeMap[type] || type
  }

  const getFileIcon = (type: 'images' | 'videos' | 'audios') => {
    switch (type) {
      case 'images': return ImageIcon
      case 'videos': return Video
      case 'audios': return Volume2
      default: return ImageIcon
    }
  }

  const getFileTypeLabel = (type: 'images' | 'videos' | 'audios') => {
    switch (type) {
      case 'images': return '图片'
      case 'videos': return '视频'
      case 'audios': return '音频'
      default: return '文件'
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* 题目类型标签 */}
      <div className="flex items-center space-x-2">
        <Badge variant="outline">{getQuestionTypeLabel(editingQuestion.type)}</Badge>
        {editingQuestion.subject && (
          <Badge variant="secondary">{editingQuestion.subject}</Badge>
        )}
      </div>

      {/* 题目标题 */}
      {enableChange ? (
        <textarea
          value={editingQuestion.title}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('title', e.target.value)}
          placeholder="请输入题目内容..."
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      ) : (
        <div className="text-base leading-relaxed">
          {editingQuestion.title}
        </div>
      )}

      {/* 题目类型和科目编辑 */}
      {enableChange && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">题目类型</Label>
            <Select
              value={editingQuestion.type}
              onValueChange={(value) => handleInputChange('type', value as QuestionType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QuestionType.choice}>选择题</SelectItem>
                <SelectItem value={QuestionType.qa}>问答题</SelectItem>
                <SelectItem value={QuestionType.judge}>判断题</SelectItem>
                <SelectItem value={QuestionType.reading}>阅读题</SelectItem>
                <SelectItem value={QuestionType.summary}>总结题</SelectItem>
                <SelectItem value={QuestionType.show}>展示题</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">科目</Label>
            <Input
              id="subject"
              value={editingQuestion.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="请输入科目"
            />
          </div>
        </div>
      )}

      {/* 选择题选项 */}
      {editingQuestion.type === QuestionType.choice && editingQuestion.options && editingQuestion.options.length > 0 && (
        <div className="space-y-2">
          {editingQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm font-medium w-6">{String.fromCharCode(65 + index)}.</span>
              {enableChange ? (
                <>
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`选项 ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <span className="text-sm">
                  {option}
                </span>
              )}
            </div>
          ))}
          {enableChange && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="w-full"
            >
              添加选项
            </Button>
          )}
        </div>
      )}

      {/* 图片文件 - 预览展示 */}
      {editingQuestion.images && editingQuestion.images.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {editingQuestion.images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`图片 ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 文档文件 - 预览展示 */}
      {editingQuestion.attachments && editingQuestion.attachments.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {editingQuestion.attachments.map((attachmentUrl, index) => (
              <div key={index} className="relative group">
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(attachmentUrl)}&embedded=true`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 视频文件 - 可播放 */}
      {editingQuestion.videos && editingQuestion.videos.length > 0 && (
        <div className="space-y-2">
          <div className="space-y-4">
            {editingQuestion.videos.map((videoUrl, index) => (
              <div key={index} className="relative">
                {playingVideo === videoUrl ? (
                  <video
                    src={videoUrl}
                    controls
                    className="w-full max-h-64 rounded-lg"
                    onEnded={() => setPlayingVideo(null)}
                  />
                ) : (
                  <div className="relative">
                    <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVideoPlay(videoUrl)}
                        className="h-12 w-12 rounded-full bg-white/80 hover:bg-white"
                      >
                        <Play className="w-6 h-6 text-gray-700" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 音频文件 - 可播放 */}
      {editingQuestion.audios && editingQuestion.audios.length > 0 && (
        <div className="space-y-2">
          <div className="space-y-2">
            {editingQuestion.audios.map((audioUrl, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAudioPlay(audioUrl)}
                  className="h-8 w-8 p-0"
                >
                  {playingAudio === audioUrl ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <span className="text-sm flex-1">音频 {index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 音频播放器 */}
      {playingAudio && (
        <audio
          src={playingAudio}
          controls
          autoPlay
          onEnded={() => setPlayingAudio(null)}
          className="w-full"
        />
      )}

      {/* 网络链接 */}
      {editingQuestion.links && editingQuestion.links.length > 0 && (
        <div className="space-y-2">
          <div className="space-y-2">
            {editingQuestion.links.map((link, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 border rounded-lg">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex-1 truncate"
                >
                  {link}
                </a>
                <span className="text-xs text-gray-500">外部链接</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

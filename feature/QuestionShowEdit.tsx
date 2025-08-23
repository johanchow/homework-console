'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/component/button'
import { Badge } from '@/component/badge'
import { X, Image as ImageIcon, Video, Volume2, Play, Pause, FileText, Link as LinkIcon, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/component/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/select'
import { Label } from '@/component/label'
import { Question, QuestionType, questionTypeLabel, questionTypeIcon, QuestionSubject, questionSubjectLabel } from '@/entity/question'
import { parseQuestionFromImages } from '@/api/axios/question'

interface QuestionShowEditProps {
  question: Question
  onChange?: (question: Question) => void
}

export function QuestionShowEdit({ question, onChange }: QuestionShowEditProps) {
  const [editingQuestion, setEditingQuestion] = useState<Question>(question)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  useEffect(() => {
    setEditingQuestion(question)
  }, [question])

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

  const updateQuestion = (updates: Partial<Question>) => {
    const updated = { ...editingQuestion, ...updates }
    setEditingQuestion(updated)
    onChange?.(updated)
  }

  const addOption = () => {
    const newOptions = [...(editingQuestion.options || []), '']
    updateQuestion({ options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(editingQuestion.options || [])]
    newOptions[index] = value
    updateQuestion({ options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = editingQuestion.options?.filter((_, i) => i !== index) || []
    updateQuestion({ options: newOptions })
  }

  const addLink = () => {
    const newLinks = [...(editingQuestion.links || []), '']
    updateQuestion({ links: newLinks })
  }

  const updateLink = (index: number, value: string) => {
    const newLinks = [...(editingQuestion.links || [])]
    newLinks[index] = value
    updateQuestion({ links: newLinks })
  }

  const removeLink = (index: number) => {
    const newLinks = editingQuestion.links?.filter((_, i) => i !== index) || []
    updateQuestion({ links: newLinks })
  }

  return (
    <div className="w-full space-y-4">
      {/* 第一行：题目类型 + icon */}
      <div className="flex items-center space-x-2">
        <span className="text-lg">{questionTypeIcon[editingQuestion.type]}</span>
        <Select
          value={editingQuestion.type}
          onValueChange={(value) => updateQuestion({ type: value as QuestionType })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(QuestionType).map((type) => (
              <SelectItem key={type} value={type}>
                {questionTypeLabel[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={editingQuestion.subject}
          onValueChange={(value) => updateQuestion({ subject: value })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(QuestionSubject).map((subject) => (
              <SelectItem key={subject} value={subject}>
                {questionSubjectLabel[subject]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 第二行：题目标题 */}
      <div className="space-y-2">
        <Label htmlFor="title">题目标题</Label>
        <Input
          id="title"
          value={editingQuestion.title}
          onChange={(e) => updateQuestion({ title: e.target.value })}
          placeholder="请输入题目标题"
          className="text-base"
        />
      </div>

      {/* 题目提示 */}
      <div className="space-y-2">
        <Label htmlFor="tip">题目提示</Label>
        <textarea
          id="tip"
          value={editingQuestion.tip || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateQuestion({ tip: e.target.value })}
          placeholder="请输入题目提示或要求（可选）"
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* 网络链接 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>相关链接</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLink}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            添加链接
          </Button>
        </div>
        <div className="space-y-2">
          {editingQuestion.links?.map((link, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={link}
                onChange={(e) => updateLink(index, e.target.value)}
                placeholder="请输入链接URL"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeLink(index)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* 选择题选项 */}
      {editingQuestion.type === QuestionType.choice && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>选项</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="h-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              添加选项
            </Button>
          </div>
          <div className="space-y-2">
            {editingQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-sm font-medium w-6">{String.fromCharCode(65 + index)}.</span>
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`选项 ${String.fromCharCode(65 + index)}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 图片文件 */}
      {editingQuestion.images && editingQuestion.images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-fit">
              <ImageIcon className="w-4 h-4" />
              <span>图片：</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1">
              {editingQuestion.images.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`图片 ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 文档文件 */}
      {editingQuestion.attachments && editingQuestion.attachments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-fit">
              <FileText className="w-4 h-4" />
              <span>文档：</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1">
              {editingQuestion.attachments.map((attachmentUrl, index) => (
                <div key={index} className="relative">
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(attachmentUrl)}&embedded=true`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 视频文件 */}
      {editingQuestion.videos && editingQuestion.videos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-fit">
              <Video className="w-4 h-4" />
              <span>视频：</span>
            </div>
            <div className="space-y-4 flex-1">
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
        </div>
      )}

      {/* 音频文件 */}
      {editingQuestion.audios && editingQuestion.audios.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-fit">
              <Volume2 className="w-4 h-4" />
              <span>音频：</span>
            </div>
            <div className="space-y-2 flex-1">
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

      {/* 材料内容 */}
      <div className="space-y-2">
        <Label htmlFor="material">材料内容</Label>
        <textarea
          id="material"
          value={editingQuestion.material || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateQuestion({ material: e.target.value })}
          placeholder="请输入材料内容或AI自动填入"
          rows={6}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  )
}

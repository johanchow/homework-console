'use client'

import { useState } from 'react'
import { Button } from '@/component/button'
import { Badge } from '@/component/badge'
import { Input } from '@/component/input'
import { X, Image as ImageIcon, Video, Volume2, Play, Pause, FileText, Link as LinkIcon } from 'lucide-react'
import { Question, QuestionType, questionTypeLabel } from '@/entity/question'

interface QuestionShowProps {
  question: Question
  onChange?: (question: Question) => void
}

export function QuestionShow({ question, onChange }: QuestionShowProps) {
  const [editingQuestion, setEditingQuestion] = useState<Question>(question)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  const handleAnswerChange = (answer: string) => {
    const updatedQuestion = {
      ...editingQuestion,
      answer,
      updated_at: new Date()
    }
    setEditingQuestion(updatedQuestion)
    onChange?.(updatedQuestion)
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

  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case QuestionType.choice:
        return <span className="text-lg">📝</span>
      case QuestionType.qa:
        return <span className="text-lg">❓</span>
      case QuestionType.judge:
        return <span className="text-lg">✅</span>
      case QuestionType.reading:
        return <span className="text-lg">📖</span>
      case QuestionType.summary:
        return <span className="text-lg">📝</span>
      case QuestionType.show:
        return <span className="text-lg">🎭</span>
      default:
        return <span className="text-lg">📝</span>
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* 第一行：题目类型 + icon */}
      <div className="flex items-center space-x-2">
        {getQuestionTypeIcon(editingQuestion.type)}
        <Badge variant="outline">{questionTypeLabel[editingQuestion.type]}</Badge>
        {editingQuestion.subject && (
          <Badge variant="secondary">{editingQuestion.subject}</Badge>
        )}
      </div>

      {/* 第二行：题目标题 */}
      <div className="text-base leading-relaxed font-medium">
        {editingQuestion.title}
      </div>

      {/* 第三行：网络链接 */}
      {editingQuestion.links && editingQuestion.links.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-fit">
              <LinkIcon className="w-4 h-4" />
              <span>相关链接：</span>
            </div>
            <div className="space-y-1 flex-1">
              {editingQuestion.links.map((link, index) => (
                <div key={index} className="flex items-center hover:bg-gray-50">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm flex-1 truncate"
                  >
                    {link}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 选择题选项 */}
      {editingQuestion.type === QuestionType.choice && editingQuestion.options && editingQuestion.options.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <div className="text-sm text-gray-600 font-medium min-w-fit">选项：</div>
            <div className="space-y-1 flex-1">
              {editingQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-sm font-medium w-6">{String.fromCharCode(65 + index)}.</span>
                  <span className="text-sm">{option}</span>
                </div>
              ))}
            </div>
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

      {/* 最后一行：答案（可编辑） */}
      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          <div className="text-sm font-medium text-gray-700 min-w-fit">答案：</div>
          <div className="flex-1">
            <textarea
              value={editingQuestion.answer || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleAnswerChange(e.target.value)}
              placeholder="请输入答案..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface AnswerShowProps {
  answerValue: string | 'FINISHED' | undefined; // 可能是音频url、视频url、文本字符串、布尔值
}

// 检测URL是否为音频文件
const isAudioUrl = (url: string): boolean => {
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];
  return audioExtensions.some(ext => url.toLowerCase().includes(ext)) ||
    url.includes('audio') ||
    url.includes('sound');
};

// 检测URL是否为视频文件
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext)) ||
    url.includes('video');
};

// 检测是否为URL
const isUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch {
    return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('www.');
  }
};

export function AnswerShow({ answerValue }: AnswerShowProps) {
  console.log('answerValue', answerValue);

  // 处理已完成的情况
  if (answerValue === 'FINISHED') {
    return (
      <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <p className="text-sm text-green-600 font-medium">已完成</p>
      </div>
    );
  }

  // 处理未作答的情况
  if (!answerValue || answerValue.trim() === '') {
    return (
      <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-md">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <p className="text-sm text-red-600 font-medium">未作答</p>
      </div>
    );
  }

  // 检查是否为URL
  if (isUrl(answerValue)) {
    // 音频URL
    if (isAudioUrl(answerValue)) {
      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">音频答案：</p>
          <audio
            controls
            className="w-full max-w-md"
            preload="metadata"
            onError={(e) => {
              console.error('音频加载失败:', e);
              const target = e.target as HTMLAudioElement;
              target.style.display = 'none';
              const errorMsg = target.parentElement?.querySelector('.audio-error');
              if (!errorMsg) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'audio-error text-sm text-red-600 mt-2';
                errorDiv.textContent = '音频加载失败，请检查文件格式或网络连接';
                target.parentElement?.appendChild(errorDiv);
              }
            }}
            onLoadStart={() => {
              console.log('开始加载音频:', answerValue);
            }}
            onCanPlay={() => {
              console.log('音频可以播放');
            }}
          >
            {/* 添加多种格式支持 */}
            <source src={answerValue} type="audio/mpeg" />
            <source src={answerValue} type="audio/mp4" />
            <source src={answerValue} type="audio/ogg" />
            <source src={answerValue} type="audio/wav" />
            <source src={answerValue} type="audio/aac" />
            <source src={answerValue} type="audio/x-m4a" />
            <div className="text-sm text-gray-600 mt-2">
              您的浏览器不支持音频播放。
              <a href={answerValue} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                点击下载音频文件
              </a>
            </div>
          </audio>
        </div>
      );
    }

    // 视频URL
    if (isVideoUrl(answerValue)) {
      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">视频答案：</p>
          <video
            controls
            className="w-full max-w-md rounded-md"
            preload="metadata"
            onError={(e) => {
              console.error('视频加载失败:', e);
              const target = e.target as HTMLVideoElement;
              target.style.display = 'none';
              const errorMsg = target.parentElement?.querySelector('.video-error');
              if (!errorMsg) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'video-error text-sm text-red-600 mt-2';
                errorDiv.textContent = '视频加载失败，请检查文件格式或网络连接';
                target.parentElement?.appendChild(errorDiv);
              }
            }}
            onLoadStart={() => {
              console.log('开始加载视频:', answerValue);
            }}
            onCanPlay={() => {
              console.log('视频可以播放');
            }}
          >
            {/* 添加多种格式支持 */}
            <source src={answerValue} type="video/mp4" />
            <source src={answerValue} type="video/webm" />
            <source src={answerValue} type="video/ogg" />
            <source src={answerValue} type="video/avi" />
            <source src={answerValue} type="video/mov" />
            <div className="text-sm text-gray-600 mt-2">
              您的浏览器不支持视频播放。
              <a href={answerValue} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                点击下载视频文件
              </a>
            </div>
          </video>
        </div>
      );
    }

    // 其他URL（可能是文件链接等）
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-600">链接答案：</p>
        <a
          href={answerValue}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all text-sm"
        >
          {answerValue}
        </a>
      </div>
    );
  }

  // 文本答案
  return (
    <div className="space-y-1">
      <p className="text-sm text-gray-600">文本答案：</p>
      <p className="text-sm whitespace-pre-wrap break-words">{answerValue}</p>
    </div>
  );
}

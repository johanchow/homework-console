import type { Metadata } from 'next'
import './global.css'
import { Header } from '@/feature/header'

export const metadata: Metadata = {
  title: '作业控制台',
  description: '现代化的作业管理系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

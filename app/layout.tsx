import type { Metadata } from 'next'
import './global.css'
import { Header } from '@/feature/Header'

export const metadata: Metadata = {
  title: '自主学习',
  description: '自主学习管理台',
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

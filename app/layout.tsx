import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './global.css'
import { Header } from '@/feature/Header'
import { ReactQueryProvider } from '@/api/query-base/client-query'
import { createServerQueryClient } from '@/api/query-base/server-query'
import { getUserProfile } from '@/api/fetch/user'
import { GlobalLoginModal } from '@/feature/GlobalLoginModal'
import { Toaster } from '@/component/sonner'

export const metadata: Metadata = {
  title: '自主学习',
  description: '自主学习管理台',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const serverQuery = createServerQueryClient()
  const cookieStore = await cookies()
  const userId = cookieStore.get(process.env.NEXT_PUBLIC_USERID_COOKIE_NAME!)?.value
  console.log('userId ==================== ', userId)
  if (userId) {
    await serverQuery.prefetch([
      {
        queryKey: ['user', userId],
        queryFn: () => getUserProfile(),
      },
    ])
  }

  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen flex flex-col">
          <ReactQueryProvider state={serverQuery.dehydratedState()}>
            <ReactQueryDevtools />
            <Header />
            <main className="flex-1">
              {children}
            </main>
            {/* <GlobalLoginModal /> */}
            <Toaster />
            <ReactQueryDevtools />
          </ReactQueryProvider>
        </div>
      </body>
    </html>
  )
}

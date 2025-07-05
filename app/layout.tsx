import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './global.css'
import { Header } from '@/feature/Header'
import { ReactQueryProvider } from '@/api/query-base/client-query-provider'
import { createServerQueryClient } from '@/api/query-base/server-query'
import { getUserProfile } from '@/api/fetch/user'

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
  const token = cookieStore.get('Authorization')?.value
  if (token) {
    await serverQuery.prefetch([
      {
        queryKey: ['user', token],
        queryFn: () => getUserProfile(),
      },
    ])
  }

  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen flex flex-col">
          <ReactQueryProvider state={serverQuery.dehydratedState()}>
            <Header />
            <main className="flex-1">
                {children}
            </main>
          </ReactQueryProvider>
        </div>
      </body>
    </html>
  )
}

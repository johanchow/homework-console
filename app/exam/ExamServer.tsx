'use server'

import { createServerQueryClient } from '@/api/query-base/server-query'
import { listExams } from '@/api/axios/exam'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { ExamClient } from './ExamClient'

export async function ExamServer() {
  const queryClient = createServerQueryClient()

  // 预获取考试列表数据
  await queryClient.prefetch([{
    queryKey: ['exams', {}, { page: 1, page_size: 20 }],
    queryFn: () => listExams({}, { page: 1, page_size: 20 }),
  }])

  return (
    <HydrationBoundary state={queryClient.dehydratedState()}>
      <ExamClient />
    </HydrationBoundary>
  )
} 
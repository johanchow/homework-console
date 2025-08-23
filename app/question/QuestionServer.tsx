import { HydrationBoundary } from '@tanstack/react-query'
import { createServerQueryClient } from '@/api/query-base/server-query'
import { listQuestions } from '@/api/fetch/question'
import { QuestionClient } from './QuestionClient'

export async function QuestionServer() {
  const serverQuery = createServerQueryClient()

  // 预取题目数据 - 确保与客户端初始状态匹配
  const initialFilters = {}
  const initialPagination = { page: 1, page_size: 20 }

  await serverQuery.prefetch([
    {
      queryKey: ['questions', initialFilters, initialPagination],
      queryFn: () => listQuestions(initialFilters, initialPagination),
    }
  ])

  const dehydratedState = serverQuery.dehydratedState()

  return (
    <HydrationBoundary state={dehydratedState}>
      <QuestionClient />
    </HydrationBoundary>
  )
} 
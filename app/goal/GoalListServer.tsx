import { HydrationBoundary } from '@tanstack/react-query'
import { createServerQueryClient } from '@/api/query-base/server-query'
import { listGoals } from '@/api/fetch/goal'
import { GoalListClient } from './GoalListClient'

export async function GoalListServer() {
  const serverQuery = createServerQueryClient()

  // 预取第一页数据
  await serverQuery.prefetch([
    {
      queryKey: ['goals', { page: 1, page_size: 12, name: '' }],
      queryFn: () => listGoals({}, { page: 1, page_size: 12 }),
    },
  ])

  return <HydrationBoundary state={serverQuery.dehydratedState()}>
    <GoalListClient />
  </HydrationBoundary>
} 
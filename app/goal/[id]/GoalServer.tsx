import { HydrationBoundary } from '@tanstack/react-query'
import { createServerQueryClient } from '@/api/query-base/server-query'
import { getGoal } from '@/api/fetch/goal'
import { listExams } from '@/api/fetch/exam'
import { GoalClient } from './GoalClient'

interface GoalServerProps {
  goalId: string
}

export async function GoalServer({ goalId }: GoalServerProps) {
  const serverQuery = createServerQueryClient()

  // 预取 Goal 数据
  await serverQuery.prefetch([
    {
      queryKey: ['goal', goalId],
      queryFn: () => getGoal(goalId),
    },
    {
      queryKey: ['exams', { goal_id: goalId }],
      queryFn: () => listExams({ goal_id: goalId }, { page: 1, page_size: 100 }),
    }
  ])

  return (
    <HydrationBoundary state={serverQuery.dehydratedState()}>
      <GoalClient goalId={goalId} />
    </HydrationBoundary>
  )
} 
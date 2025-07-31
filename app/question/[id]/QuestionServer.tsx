import { createServerQueryClient } from '@/api/query-base/server-query'
import { getQuestion } from '@/api/fetch/question'
import { HydrationBoundary } from '@tanstack/react-query'
import { QuestionClient } from './QuestionClient'

interface QuestionServerProps {
  params: {
    id: string
  }
}

export async function QuestionServer({ params }: QuestionServerProps) {
  const queryClient = createServerQueryClient()

  // 预获取题目数据
  await queryClient.prefetch([{
    queryKey: ['question', params.id],
    queryFn: () => getQuestion(params.id),
  }])

  return (
    <HydrationBoundary state={queryClient.dehydratedState()}>
      <QuestionClient questionId={params.id} />
    </HydrationBoundary>
  )
} 
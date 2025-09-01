import { createServerQueryClient } from '@/api/query-base/server-query'
import { getExam } from '@/api/fetch/exam'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { ExamAnswerClient } from './ExamAnswerClient'

interface ExamAnswerServerProps {
  examId: string
}

export async function ExamAnswerServer({ examId }: ExamAnswerServerProps) {
  const serverQuery = createServerQueryClient()

  // 预获取考试数据
  await serverQuery.prefetch([{
    queryKey: ['exam', examId],
    queryFn: () => getExam(examId),
  }])

  return (
    <HydrationBoundary state={serverQuery.dehydratedState()}>
      <ExamAnswerClient examId={examId} />
    </HydrationBoundary>
  )
}

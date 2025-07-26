import { HydrationBoundary } from '@tanstack/react-query'
import { createServerQueryClient } from '@/api/query-base/server-query'
import { listQuestions } from '@/api/fetch/question'
import { QuestionClient } from './QuestionClient'

export async function QuestionServer() {
	const serverQuery = createServerQueryClient()

	// 预取题目数据
	await serverQuery.prefetch([
		{
			queryKey: ['questions', {}, { page: 1, page_size: 20 }],
			queryFn: () => listQuestions({}, { page: 1, page_size: 20 }),
		}
	])

	const dehydratedState = serverQuery.dehydratedState()

	return (
		<HydrationBoundary state={dehydratedState}>
			<QuestionClient />
		</HydrationBoundary>
	)
} 
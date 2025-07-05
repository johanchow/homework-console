import { QueryClient, dehydrate } from '@tanstack/react-query'
import { cache } from 'react'

// 同1个请求中，复用同1个queryClient实例
const getPerRequestQueryClient = cache(() => new QueryClient())

export function createServerQueryClient() {
  const queryClient = getPerRequestQueryClient()

  const prefetch = async (
    queries: {
      queryKey: unknown[]
      queryFn: () => Promise<any>
    }[],
  ) => {
    await Promise.all(
      queries.map(({ queryKey, queryFn }) => queryClient.prefetchQuery({ queryKey, queryFn })),
    )
  }

  return {
    queryClient,
    prefetch,
    dehydratedState: () => dehydrate(queryClient),
  }
}

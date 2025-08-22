import { QueryClient, dehydrate } from '@tanstack/react-query'
import { cache } from 'react'

export function createServerQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0, // 立即认为数据过期
        gcTime: 0,    // 立即垃圾回收
      },
    },
  })

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

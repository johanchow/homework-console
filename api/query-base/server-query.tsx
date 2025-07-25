import { QueryClient, dehydrate } from '@tanstack/react-query'
import { cache } from 'react'

let idCounter = Math.random()
// 同1个请求中，复用同1个queryClient实例
const getPerRequestQueryClient = cache(() => {
  const queryClient = new QueryClient()
  console.log('typeof window: ', typeof window);
  if (typeof window !== 'undefined') {
    console.log('isServer .........');
    queryClient._id = idCounter++
  }
  console.log('getPerRequestQueryClient: ', queryClient._id);
  return queryClient;
})

export function createServerQueryClient() {
  const queryClient = new QueryClient()

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

'use client'

import { ReactNode } from 'react'
import { QueryClientProvider, HydrationBoundary } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'

let queryClient: QueryClient | null = null
export function ReactQueryProvider({ children, state }: { children: ReactNode; state: unknown }) {
  if (!queryClient) {
    queryClient = new QueryClient()
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={state}> {children} </HydrationBoundary>
    </QueryClientProvider>
  )
}

'use client'

import { ReactNode } from 'react'
import { QueryClientProvider, HydrationBoundary } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'

let queryClient: QueryClient | null = null

export function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient()
  }
  return queryClient
}

export function ReactQueryProvider({ children, state }: { children: ReactNode; state: unknown }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={state}> {children} </HydrationBoundary>
    </QueryClientProvider>
  )
}

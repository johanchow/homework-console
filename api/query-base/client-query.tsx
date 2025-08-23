'use client'

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider, HydrationBoundary } from '@tanstack/react-query'

export function getQueryClient() {
  return new QueryClient()
}

export function ReactQueryProvider({ children, state }: { children: ReactNode; state: unknown }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={state}>{children}</HydrationBoundary>
    </QueryClientProvider>
  )
}

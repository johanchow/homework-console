import { Suspense } from 'react'
import { GoalListServer } from './GoalListServer'
import { GoalListSkeleton } from './GoalListSkeleton'

export default function GoalPage() {
  return (
    <Suspense fallback={<GoalListSkeleton />}>
      <GoalListServer />
    </Suspense>
  )
}

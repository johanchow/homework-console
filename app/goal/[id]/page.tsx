import { GoalServer } from './GoalServer'

interface GoalDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { id } = await params
  console.log('GoalDetailPage id: ', id)
  return <GoalServer goalId={id} />
}

import { GoalServer } from './GoalServer'

interface GoalDetailPageProps {
  params: {
    id: string
  }
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { id } = await params
  console.log('GoalDetailPage id: ', id)
  return <GoalServer goalId={id} />
}
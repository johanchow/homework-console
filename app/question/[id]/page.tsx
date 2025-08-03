import { QuestionServer } from './QuestionServer'

interface QuestionDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const { id } = await params
  return <QuestionServer id={id} />
}

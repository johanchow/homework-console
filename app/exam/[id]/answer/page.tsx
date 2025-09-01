import { ExamAnswerServer } from './ExamAnswerServer'

interface ExamAnswerPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ExamAnswerPage({ params }: ExamAnswerPageProps) {
  const { id } = await params
  return <ExamAnswerServer examId={id} />
}
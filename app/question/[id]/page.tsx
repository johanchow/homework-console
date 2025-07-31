import { QuestionServer } from './QuestionServer'

interface QuestionDetailPageProps {
	params: {
		id: string
	}
}

export default function QuestionDetailPage({ params }: QuestionDetailPageProps) {
	return <QuestionServer params={params} />
}

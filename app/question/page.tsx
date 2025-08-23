import { QuestionServer } from './QuestionServer'

// 强制动态渲染，禁用缓存
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function QuestionPage() {
  return <QuestionServer />
}
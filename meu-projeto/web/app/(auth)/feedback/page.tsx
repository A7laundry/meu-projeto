export const revalidate = 0

import { listMyFeedback } from '@/actions/feedback/crud'
import { FeedbackForm } from '@/components/domain/feedback/feedback-form'
import { FeedbackList } from '@/components/domain/feedback/feedback-list'
import { MessageSquareText } from 'lucide-react'

export default async function FeedbackPage() {
  const feedbacks = await listMyFeedback()

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <MessageSquareText size={20} className="text-blue-400/70" />
          <h1 className="text-2xl font-bold text-white">Feedback de Teste</h1>
        </div>
        <p className="text-sm text-white/40">
          Ajude-nos a melhorar o sistema reportando problemas, sugestões ou pontos positivos.
        </p>
      </div>

      <FeedbackForm />
      <FeedbackList feedbacks={feedbacks} />
    </div>
  )
}

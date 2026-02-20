import { getFlaggedQuestionsAction, getFlaggedAnswersAction } from '@/actions/admin-community.actions'
import { CommunityModerationList } from '@/presentation/features/admin/components'
import { AlertCircle, MessageSquare } from 'lucide-react'

export default async function AdminCommunityPage() {
    const [questionsResult, answersResult] = await Promise.all([
        getFlaggedQuestionsAction(),
        getFlaggedAnswersAction()
    ])

    const totalFlagged = (questionsResult.questions?.length || 0) + (answersResult.answers?.length || 0)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">إشراف المجتمع</h1>
                    <p className="text-muted-foreground mt-1">مراجعة الأسئلة والأجوبة المبلغ عنها لاتخاذ الإجراء المناسب.</p>
                </div>
                {totalFlagged > 0 && (
                    <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-full text-sm font-bold border border-rose-100 flex items-center gap-2">
                        <AlertCircle size={16} />
                        {totalFlagged} بلاغات معلقة
                    </div>
                )}
            </div>

            <CommunityModerationList
                flaggedQuestions={questionsResult.questions || []}
                flaggedAnswers={answersResult.answers || []}
            />
        </div>
    )
}

import { getFlaggedQuestionsAction, getFlaggedAnswersAction } from '@/actions/admin-community.actions'
import { CommunityModerationList } from '@/presentation/features/admin/components'
import { AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ContentAdminCommunityPage() {
    const [questionsResult, answersResult] = await Promise.all([
        getFlaggedQuestionsAction(),
        getFlaggedAnswersAction(),
    ])

    const totalFlagged = (questionsResult.questions?.length ?? 0) + (answersResult.answers?.length ?? 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/content-admin" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <ArrowRight size={18} />
                </Link>
                <div className="flex-1 flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">إشراف المجتمع</h1>
                        <p className="text-muted-foreground mt-0.5 text-sm">مراجعة الأسئلة والأجوبة المبلغ عنها</p>
                    </div>
                    {totalFlagged > 0 && (
                        <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-full text-sm font-bold border border-rose-100 flex items-center gap-2 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800">
                            <AlertCircle size={16} />
                            {totalFlagged} بلاغات معلقة
                        </div>
                    )}
                </div>
            </div>
            <CommunityModerationList
                flaggedQuestions={questionsResult.questions || []}
                flaggedAnswers={answersResult.answers || []}
            />
        </div>
    )
}

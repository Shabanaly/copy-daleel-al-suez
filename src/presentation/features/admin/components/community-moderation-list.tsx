'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Check, Trash2, User, Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { dismissFlagAction, deleteFlaggedContentAction } from '@/actions/admin-community.actions'
import { cn } from '@/lib/utils'
import { Button } from '@/presentation/ui/button'

interface Props {
    flaggedQuestions: any[]
    flaggedAnswers: any[]
}

export function CommunityModerationList({ flaggedQuestions, flaggedAnswers }: Props) {
    const [tab, setTab] = useState<'questions' | 'answers'>('questions')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleAction = async (type: 'question' | 'answer', id: string, action: 'dismiss' | 'delete') => {
        if (action === 'delete' && !confirm('هل أنت متأكد من حذف هذا المحتوى نهائياً؟')) return

        startTransition(async () => {
            const result = action === 'dismiss'
                ? await dismissFlagAction(type, id)
                : await deleteFlaggedContentAction(type, id)

            if (result.success) {
                toast.success(action === 'dismiss' ? 'تم تجاهل البلاغ' : 'تم حذف المحتوى')
                router.refresh()
            } else {
                toast.error(result.error || 'حدث خطأ')
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex border-b border-border">
                <button
                    onClick={() => setTab('questions')}
                    className={cn(
                        "px-6 py-3 text-sm font-bold border-b-2 transition-colors",
                        tab === 'questions' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    الأسئلة ({flaggedQuestions.length})
                </button>
                <button
                    onClick={() => setTab('answers')}
                    className={cn(
                        "px-6 py-3 text-sm font-bold border-b-2 transition-colors",
                        tab === 'answers' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    الأجوبة ({flaggedAnswers.length})
                </button>
            </div>

            <div className="space-y-4">
                {tab === 'questions' ? (
                    flaggedQuestions.length === 0 ? (
                        <div className="py-12 text-center bg-muted/20 rounded-xl border border-dashed">
                            <p className="text-muted-foreground">لا توجد أسئلة مبلغ عنها حالياً.</p>
                        </div>
                    ) : (
                        flaggedQuestions.map((q) => (
                            <div key={q.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors shadow-sm">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                            <MessageSquare size={12} />
                                            {q.category}
                                        </div>
                                        <h3 className="font-bold text-lg leading-tight">{q.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-3">{q.body}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><User size={14} /> {q.profiles?.full_name}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(q.created_at).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAction('question', q.id, 'dismiss')}
                                            disabled={isPending}
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                        >
                                            <Check size={16} className="ml-2" />
                                            سليم
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleAction('question', q.id, 'delete')}
                                            disabled={isPending}
                                        >
                                            <Trash2 size={16} className="ml-2" />
                                            حذف
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    flaggedAnswers.length === 0 ? (
                        <div className="py-12 text-center bg-muted/20 rounded-xl border border-dashed">
                            <p className="text-muted-foreground">لا توجد أجوبة مبلغ عنها حالياً.</p>
                        </div>
                    ) : (
                        flaggedAnswers.map((a) => (
                            <div key={a.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors shadow-sm">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="bg-muted p-2 rounded-lg text-xs text-muted-foreground">
                                            <span className="font-bold block mb-1">رداً على السؤال:</span>
                                            {a.question?.title}
                                        </div>
                                        <p className="text-sm text-foreground leading-relaxed italic border-r-4 border-primary/20 pr-4 mt-2">"{a.body}"</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><User size={14} /> {a.profiles?.full_name}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(a.created_at).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAction('answer', a.id, 'dismiss')}
                                            disabled={isPending}
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                        >
                                            <Check size={16} className="ml-2" />
                                            سليم
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleAction('answer', a.id, 'delete')}
                                            disabled={isPending}
                                        >
                                            <Trash2 size={16} className="ml-2" />
                                            حذف
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    )
}

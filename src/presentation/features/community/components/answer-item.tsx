'use client'

import { CommunityAnswer } from "@/domain/entities/community-qa"
import { ThumbsUp, CheckCircle, User, Clock, Trash2, Loader2, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"
import { voteAction } from "@/actions/community.actions"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/presentation/ui/button"

interface AnswerItemProps {
    answer: CommunityAnswer;
    isQuestionOwner: boolean;
    currentUserId: string | null;
    onAccept?: () => void;
    onDelete?: () => void;
}

export function AnswerItem({ answer, isQuestionOwner, currentUserId, onAccept, onDelete }: AnswerItemProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [votes, setVotes] = useState(answer.votes_count)

    const handleVote = async () => {
        try {
            await voteAction('answer', answer.id, 'upvote')
            // Refresh logic usually handled by parent refresh
            toast.success("تم تحديث تصويتك")
        } catch (error) {
            toast.error("يجب تسجيل الدخول للتصويت")
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-3xl border ${answer.is_accepted ? 'border-green-500/50 bg-green-500/5 shadow-md' : 'border-border/50 bg-card'}`}
        >
            <div className="flex gap-4">
                {/* Voting Sidebar */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                        onClick={handleVote}
                        className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ThumbsUp size={20} />
                    </button>
                    <span className="font-bold text-sm">{votes}</span>
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <User size={16} className="text-muted-foreground" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-bold">{answer.author?.full_name || 'مستخدم دليل السويس'}</p>
                                    {(answer.author?.role === 'admin' || answer.author?.role === 'super_admin') && (
                                        <span className="flex items-center gap-0.5 text-[9px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full border border-secondary/20 font-bold">
                                            <ShieldCheck size={10} className="fill-secondary/10" />
                                            الإدارة
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    {new Date(answer.created_at).toLocaleDateString('ar-EG')}
                                </p>
                            </div>
                        </div>

                        {answer.is_accepted && (
                            <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle size={12} />
                                إجابة مقبولة
                            </div>
                        )}

                        {answer.user_id === currentUserId && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                className="text-destructive hover:text-destructive hover:bg-destructive/5 h-8 w-8 rounded-full p-0"
                                title="حذف الإجابة"
                            >
                                <Trash2 size={14} />
                            </Button>
                        )}
                    </div>

                    <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {answer.content}
                    </div>

                    {isQuestionOwner && !answer.is_accepted && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onAccept}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/10 h-8 font-bold text-xs gap-1.5"
                        >
                            <CheckCircle size={14} />
                            قبول كأفضل إجابة
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

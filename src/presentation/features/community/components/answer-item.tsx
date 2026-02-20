'use client'

import { CommunityAnswer } from "@/domain/entities/community-qa"
import { ThumbsUp, CheckCircle, User, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { voteAction } from "@/actions/community.actions"
import { useState } from "react"
import { toast } from "sonner"

interface AnswerItemProps {
    answer: CommunityAnswer;
    isOwner: boolean;
    onAccept?: () => void;
}

export function AnswerItem({ answer, isOwner, onAccept }: AnswerItemProps) {
    const [votes, setVotes] = useState(answer.upvote_count)

    const handleVote = async () => {
        try {
            await voteAction('answer', answer.id, 'upvote')
            setVotes(prev => prev + 1)
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
                                <p className="text-xs font-bold">مستخدم دليل السويس</p>
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
                    </div>

                    <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {answer.body}
                    </div>

                    {isOwner && !answer.is_accepted && (
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

import { Button } from "@/presentation/ui/button"

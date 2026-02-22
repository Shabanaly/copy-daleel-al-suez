import React from "react"

import { CommunityQuestion } from "@/domain/entities/community-qa"
import { MessageSquare, ThumbsUp, Eye, Clock, Hash, ChevronRight, User, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface QuestionCardProps {
    question: CommunityQuestion;
    index: number;
}


export function QuestionCard({ question, index }: QuestionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            <Link href={`/community/${question.id}`}>
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                    {/* Background accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

                    <div className="flex flex-col gap-4 relative">
                        {/* Header: Time */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <User size={14} className="text-muted-foreground" />
                                </div>
                                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                    {question.author?.full_name || 'مستخدم دليل السويس'}
                                    {(question.author?.role === 'admin' || question.author?.role === 'super_admin') && (
                                        <span className="flex items-center gap-0.5 text-[9px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full border border-secondary/20">
                                            <ShieldCheck size={10} className="fill-secondary/10" />
                                            الإدارة
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <Clock size={12} />
                                <span>{new Date(question.created_at).toLocaleDateString('ar-EG')}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-3 leading-relaxed">
                                {question.content.endsWith('؟') || question.content.endsWith('?') ? question.content : `${question.content}؟`}
                            </h3>
                        </div>

                        {/* Footer: Stats */}
                        <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <ThumbsUp size={14} className={question.votes_count > 0 ? "text-primary" : ""} />
                                    <span className={question.votes_count > 0 ? "font-bold text-foreground" : ""}>
                                        {question.votes_count}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <MessageSquare size={14} className={question.answers_count > 0 ? "text-secondary" : ""} />
                                    <span className={question.answers_count > 0 ? "font-bold text-foreground" : ""}>
                                        {question.answers_count}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Eye size={14} />
                                    <span>{question.views}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 text-primary text-xs font-bold group/btn">
                                تفاصيل
                                <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                            </div>
                        </div>
                    </div>

                    {/* Status icon for accepted answer */}
                    {question.accepted_answer_id && (
                        <div className="absolute top-4 right-4 text-green-500" title="تمت الإجابة">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    )
}

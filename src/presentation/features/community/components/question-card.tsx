'use client'

import { CommunityQuestion } from "@/domain/entities/community-qa"
import { MessageSquare, ThumbsUp, Eye, Clock, Hash, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface QuestionCardProps {
    question: CommunityQuestion;
    index: number;
}

const categoryMap: Record<string, { label: string, color: string }> = {
    'places': { label: 'أماكن', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    'events': { label: 'فعاليات', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    'general': { label: 'عام', color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20' },
    'advice': { label: 'نصائح', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
    'recommendations': { label: 'ترشيحات', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
}

export function QuestionCard({ question, index }: QuestionCardProps) {
    const category = categoryMap[question.category] || categoryMap.general

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            <Link href={`/community/${question.id}`}>
                <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                    {/* Background accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

                    <div className="flex flex-col gap-4 relative">
                        {/* Header: Category & Time */}
                        <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${category.color}`}>
                                {category.label}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock size={12} />
                                <span>{new Date(question.created_at).toLocaleDateString('ar-EG')}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {question.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {question.body}
                            </p>
                        </div>

                        {/* Tags */}
                        {question.tags && question.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {question.tags.map(tag => (
                                    <span key={tag} className="text-[10px] text-muted-foreground flex items-center gap-0.5 bg-muted/50 px-1.5 py-0.5 rounded">
                                        <Hash size={10} />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Footer: Stats */}
                        <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <ThumbsUp size={14} className={question.upvote_count > 0 ? "text-primary" : ""} />
                                    <span className={question.upvote_count > 0 ? "font-bold text-foreground" : ""}>
                                        {question.upvote_count}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <MessageSquare size={14} className={question.answer_count > 0 ? "text-secondary" : ""} />
                                    <span className={question.answer_count > 0 ? "font-bold text-foreground" : ""}>
                                        {question.answer_count}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Eye size={14} />
                                    <span>{question.view_count}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 text-primary text-xs font-bold group/btn">
                                تفاصيل
                                <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                            </div>
                        </div>
                    </div>

                    {/* Status icon for accepted answer */}
                    {question.has_accepted_answer && (
                        <div className="absolute top-4 right-4 text-green-500" title="تمت الإجابة">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    )
}

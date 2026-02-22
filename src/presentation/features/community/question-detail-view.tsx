'use client'

import React, { useState, useEffect } from "react"
import { CommunityQuestion, CommunityAnswer } from "@/domain/entities/community-qa"
import { getQuestionByIdAction, getAnswersAction, voteAction, acceptAnswerAction, deleteQuestionAction, updateQuestionAction, deleteAnswerAction } from "@/actions/community.actions"
import { AnswerItem } from "./components/answer-item"
import { AnswerForm } from "./components/answer-form"
import { Button } from "@/presentation/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { ThumbsUp, MessageSquare, Eye, Clock, ChevronLeft, User, Loader2, Pencil, Trash2, X, Check, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ViewTracker } from "@/presentation/components/shared/view-tracker"

interface QuestionDetailViewProps {
    questionId: string;
    initialQuestion?: CommunityQuestion;
    initialAnswers?: CommunityAnswer[];
}

export function QuestionDetailView({ questionId, initialQuestion, initialAnswers = [] }: QuestionDetailViewProps) {
    const [question, setQuestion] = useState<CommunityQuestion | null>(initialQuestion || null)
    const [answers, setAnswers] = useState<CommunityAnswer[]>(initialAnswers)
    const [loading, setLoading] = useState(!initialQuestion)
    const [userId, setUserId] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const fetchData = async () => {
        setLoading(true)
        try {
            const [q, a, { data: { user } }] = await Promise.all([
                getQuestionByIdAction(questionId),
                getAnswersAction(questionId),
                supabase.auth.getUser()
            ])
            setQuestion(q)
            setAnswers(a)
            setUserId(user?.id || null)
            if (q) setEditContent(q.content)
        } catch (error) {
            console.error("Fetch question detail error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!initialQuestion) {
            fetchData()
        } else {
            // Just get userId if we already have the data
            supabase.auth.getUser().then(({ data: { user } }) => {
                setUserId(user?.id || null)
            })
        }
    }, [questionId])

    const handleQuestionVote = async () => {
        if (!userId) {
            toast.error("يجب تسجيل الدخول للتصويت")
            return
        }
        try {
            await voteAction('question', questionId, 'upvote')
            const updatedQuestion = await getQuestionByIdAction(questionId)
            if (updatedQuestion) {
                setQuestion(updatedQuestion)
            }
        } catch (error) {
            toast.error("فشل التصويت")
        }
    }

    const handleAcceptAnswer = async (answerId: string) => {
        try {
            await acceptAnswerAction(questionId, answerId)
            toast.success("تم تحديد الإجابة المقبولة")
            fetchData()
        } catch (error) {
            toast.error("فشل تنفيذ العملية")
        }
    }

    const handleDeleteQuestion = async () => {
        if (!window.confirm("هل أنت متأكد من حذف هذا السؤال؟")) return

        try {
            await deleteQuestionAction(questionId)
            toast.success("تم حذف السؤال بنجاح")
            router.push("/community")
        } catch (error) {
            toast.error("فشل حذف السؤال")
        }
    }

    const handleUpdateQuestion = async () => {
        if (!editContent.trim()) {
            toast.error("يرجى كتابة محتوى السؤال")
            return
        }

        setSubmitting(true)
        try {
            await updateQuestionAction(questionId, {
                content: editContent
            })
            toast.success("تم تحديث السؤال")
            setIsEditing(false)
            fetchData()
        } catch (error) {
            toast.error("فشل تحديث السؤال")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteAnswer = async (answerId: string) => {
        if (!window.confirm("هل أنت متأكد من حذف هذه الإجابة؟")) return

        try {
            const res = await deleteAnswerAction(questionId, answerId)
            if (res.success) {
                toast.success("تم حذف الإجابة")
                setAnswers(prev => prev.filter(a => a.id !== answerId))
                // Optionally refresh question to update answer count
                const updatedQuestion = await getQuestionByIdAction(questionId)
                if (updatedQuestion) setQuestion(updatedQuestion)
            } else {
                throw new Error("Failed")
            }
        } catch (error) {
            toast.error("فشل حذف الإجابة")
            fetchData()
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-bold italic">جاري تحميل السؤال...</p>
            </div>
        )
    }

    if (!question) {
        return (
            <div className="text-center py-20">
                <p className="text-xl font-bold mb-4">السؤال غير موجود</p>
                <Link href="/community">
                    <Button variant="outline">العودة للمجتمع</Button>
                </Link>
            </div>
        )
    }

    const isQuestionOwner = userId === question.user_id

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <Link
                href="/community"
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8 group"
            >
                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                العودة لأسئلة المجتمع
            </Link>

            <ViewTracker tableName="community_questions" id={questionId} />

            <div className="space-y-10">
                {/* Main Question Card */}
                <article className="bg-card border border-border rounded-[32px] p-6 md:p-10 shadow-sm relative overflow-hidden">
                    {/* Visual Decor */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mt-32 blur-3xl opacity-50" />

                    <div className="relative space-y-8">
                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                                <Clock size={14} />
                                <span>{new Date(question.created_at).toLocaleDateString('ar-EG')}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                                <Eye size={14} />
                                <span>{question.view_count} مشاهدة</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-6">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-4 min-h-[150px] text-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="ما هو سؤالك؟"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleUpdateQuestion}
                                            disabled={submitting}
                                            className="rounded-xl gap-2"
                                        >
                                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                            حفظ التعديلات
                                        </Button>
                                        <Button
                                            onClick={() => setIsEditing(false)}
                                            variant="outline"
                                            className="rounded-xl gap-2"
                                        >
                                            <X size={16} />
                                            إلغاء
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <h1 className="text-2xl md:text-3xl font-black text-foreground leading-tight whitespace-pre-wrap">
                                    {question.content.endsWith('؟') || question.content.endsWith('?') ? question.content : `${question.content}؟`}
                                </h1>
                            )}
                        </div>

                        {/* Author */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8 border-t border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <User className="text-primary" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-bold">{question.author?.full_name || 'مستخدم دليل السويس'}</p>
                                        {(question.author?.role === 'admin' || question.author?.role === 'super_admin') && (
                                            <span className="flex items-center gap-0.5 text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full border border-secondary/20 font-bold">
                                                <ShieldCheck size={12} className="fill-secondary/10" />
                                                الإدارة
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">عضو في المجتمع</p>
                                </div>
                                {isQuestionOwner && !isEditing && (
                                    <div className="flex items-center gap-2 mr-4">
                                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full ml-2">
                                            سؤالك
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-8 h-8 rounded-full hover:bg-primary/5 hover:text-primary transition-colors"
                                            onClick={() => {
                                                setEditContent(question.content)
                                                setIsEditing(true)
                                            }}
                                        >
                                            <Pencil size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-8 h-8 rounded-full hover:bg-destructive/5 hover:text-destructive transition-colors"
                                            onClick={handleDeleteQuestion}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Voting Button */}
                        <div className="flex justify-center pt-4">
                            <Button
                                onClick={handleQuestionVote}
                                variant="outline"
                                className={`rounded-full h-14 px-8 font-bold gap-3 transition-all ${question.votes_count > 0 ? 'bg-primary/5 border-primary/20 text-primary' : 'hover:border-primary/30'}`}
                            >
                                <ThumbsUp size={20} className={question.votes_count > 0 ? 'fill-primary/20' : ''} />
                                <span className="text-lg">{question.votes_count}</span>
                                <span>أؤيد هذا السؤال</span>
                            </Button>
                        </div>
                    </div>
                </article>

                {/* Answers Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <MessageSquare className="text-secondary" />
                            {answers.length} إجابة
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence>
                            {answers.map((answer) => (
                                <AnswerItem
                                    key={answer.id}
                                    answer={answer}
                                    isQuestionOwner={isQuestionOwner}
                                    currentUserId={userId}
                                    onAccept={() => handleAcceptAnswer(answer.id)}
                                    onDelete={() => handleDeleteAnswer(answer.id)}
                                />
                            ))}
                        </AnimatePresence>

                        {answers.length === 0 && (
                            <div className="text-center py-12 bg-muted/10 rounded-[32px] border-2 border-dashed border-border/50">
                                <MessageSquare size={40} className="mx-auto mb-4 opacity-20" />
                                <p className="text-muted-foreground font-medium">لا توجد إجابات بعد. كن أول من يساعد!</p>
                            </div>
                        )}
                    </div>

                    {/* New Answer Form */}
                    <div className="pt-8 border-t border-border/50">
                        {userId ? (
                            <div className="bg-card border border-border/50 rounded-[32px] p-6 md:p-8">
                                <AnswerForm
                                    questionId={questionId}
                                    onSuccess={fetchData}
                                />
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-muted/20 rounded-[32px] border border-border">
                                <p className="font-bold mb-4">يجب تسجيل الدخول للإجابة على هذا السؤال</p>
                                <Link href="/login">
                                    <Button className="rounded-xl px-8">تسجيل الدخول</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

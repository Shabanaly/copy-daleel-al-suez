'use client'

import { useState } from "react"
import { submitAnswerAction } from "@/actions/community.actions"
import { toast } from "sonner"
import { Button } from "@/presentation/ui/button"
import { Textarea } from "@/presentation/ui/textarea"
import { Loader2, Send } from "lucide-react"

interface AnswerFormProps {
    questionId: string;
    onSuccess: () => void;
}

export function AnswerForm({ questionId, onSuccess }: AnswerFormProps) {
    const [content, setContent] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setLoading(true)
        try {
            const result = await submitAnswerAction(questionId, content)
            if (result.success) {
                toast.success("تمت إضافة إجابتك")
                setContent("")
                onSuccess()
            } else {
                toast.error(result.error || "فشل إضافة الإجابة")
            }
        } catch (error) {
            toast.error("فشل إضافة الإجابة")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="font-bold text-lg px-1">إضافة إجابة</h4>
            <Textarea
                placeholder="اكتب إجابتك هنا وساعد الآخرين..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="rounded-2xl border-border/50 bg-card hover:border-primary/20 focus-visible:ring-primary shadow-sm transition-all resize-none"
            />
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={loading || !content.trim()}
                    className="rounded-xl h-11 px-6 font-bold gap-2 shadow-lg shadow-primary/10"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <>
                            <span>إرسال الإجابة</span>
                            <Send size={16} />
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}

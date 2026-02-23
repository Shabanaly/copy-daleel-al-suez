'use client'

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/presentation/ui/dialog"
import { Button } from "@/presentation/ui/button"
import { Input } from "@/presentation/ui/input"
import { Textarea } from "@/presentation/ui/textarea"
import { submitQuestionAction } from "@/actions/community.actions"
import { toast } from "sonner"
import { Loader2, Send, HelpCircle } from "lucide-react"

interface AskQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AskQuestionModal({ isOpen, onClose }: AskQuestionModalProps) {
    const [loading, setLoading] = useState(false)
    const [content, setContent] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmedContent = content.trim()
        if (!trimmedContent) {
            toast.error("يرجى كتابة سؤالك")
            return
        }

        if (trimmedContent.length < 10) {
            toast.error("السؤال قصير جداً، يجب أن يكون 10 أحرف على الأقل")
            return
        }

        setLoading(true)
        try {
            const result = await submitQuestionAction({
                content: trimmedContent
            })

            if (result.success) {
                toast.success("تم نشر سؤالك بنجاح")
                onClose()
                setContent("")
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "فشل نشر السؤال")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] gap-6 rounded-3xl p-6">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                        <HelpCircle className="text-primary w-6 h-6" />
                    </div>
                    <DialogTitle className="text-xl font-bold">طرح سؤال جديد</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        اسأل مجتمع السويس عن أي شيء تريده وسيقوم الآخرون بمساعدتك.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground px-1">سؤالك للمجتمع</label>
                        <Textarea
                            placeholder="اكتب سؤالك هنا... مثلاً: أفضل محل حلويات في السويس؟"
                            rows={4}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="rounded-2xl border-border/50 bg-muted/30 focus-visible:ring-primary resize-none text-base p-4"
                        />
                        <p className="text-[10px] text-muted-foreground px-1">سيتم الرد عليك من قبل أعضاء المجتمع قريباً.</p>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl h-12 font-bold gap-2 shadow-lg shadow-primary/20 text-base"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                <>
                                    <span>نشر السؤال الآن</span>
                                    <Send size={18} />
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

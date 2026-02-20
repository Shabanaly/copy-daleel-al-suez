'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/presentation/ui/dialog"
import { Button } from "@/presentation/ui/button"
import { Input } from "@/presentation/ui/input"
import { Textarea } from "@/presentation/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/ui/select"
import { CommunityCategory } from "@/domain/entities/community-qa"
import { submitQuestionAction } from "@/actions/community.actions"
import { toast } from "sonner"
import { Loader2, Send, HelpCircle } from "lucide-react"

interface AskQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AskQuestionModal({ isOpen, onClose }: AskQuestionModalProps) {
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [category, setCategory] = useState<CommunityCategory>("general")
    const [tags, setTags] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !body) {
            toast.error("يرجى ملء جميع الحقول المطلوبة")
            return
        }

        setLoading(true)
        try {
            const result = await submitQuestionAction({
                title,
                body,
                category,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean)
            })

            if (result.success) {
                toast.success("تم نشر سؤالك بنجاح")
                onClose()
                setTitle("")
                setBody("")
                setTags("")
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground px-1">عنوان السؤال</label>
                        <Input
                            placeholder="مثال: أفضل مطعم سمك في السويس؟"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="rounded-xl border-border/50 bg-muted/30 focus-visible:ring-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground px-1">التصنيف</label>
                        <Select value={category} onValueChange={(val) => setCategory(val as CommunityCategory)}>
                            <SelectTrigger className="rounded-xl border-border/50 bg-muted/30">
                                <SelectValue placeholder="اختر تصنيفاً" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="places">أماكن</SelectItem>
                                <SelectItem value="recommendations">ترشيحات</SelectItem>
                                <SelectItem value="advice">نصائح</SelectItem>
                                <SelectItem value="events">فعاليات</SelectItem>
                                <SelectItem value="general">عام</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground px-1">تفاصيل السؤال</label>
                        <Textarea
                            placeholder="اشرح بالتفصيل ما الذي تبحث عنه..."
                            rows={5}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="rounded-xl border-border/50 bg-muted/30 focus-visible:ring-primary resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground px-1">الوسوم (اختياري)</label>
                        <Input
                            placeholder="مثال: مطاعم, سمك, بور توفيق"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="rounded-xl border-border/50 bg-muted/30 focus-visible:ring-primary"
                        />
                        <p className="text-[10px] text-muted-foreground px-1">افصل بين الوسوم بفاصلة (،)</p>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl h-11 font-bold gap-2 shadow-lg shadow-primary/20"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                                <>
                                    <span>نشر السؤال</span>
                                    <Send size={16} />
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

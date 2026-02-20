'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle, Loader2, Flag } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/presentation/ui/dialog'
import { createReportAction } from '@/actions/marketplace-reports.actions'
import { cn } from '@/lib/utils'

interface ReportDialogProps {
    itemId: string
    trigger?: React.ReactNode
}

const REPORT_REASONS = [
    { value: 'scam', label: 'احتيال أو نصب' },
    { value: 'fake', label: 'منتج مقلد / غير أصلي' },
    { value: 'inappropriate', label: 'محتوى غير لائق / مسيء' },
    { value: 'misleading_price', label: 'سعر مضلل / غير حقيقي' },
    { value: 'duplicate', label: 'إعلان مكرر' },
    { value: 'wrong_category', label: 'قسم خاطئ' },
    { value: 'other', label: 'سبب آخر' }
]

export function ReportDialog({ itemId, trigger }: ReportDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [reason, setReason] = useState('')
    const [details, setDetails] = useState('')
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reason) {
            toast.error('يرجى اختيار سبب البلاغ')
            return
        }

        startTransition(async () => {
            const result = await createReportAction(itemId, reason, details)
            if (result.success) {
                toast.success('تم إرسال بلاغك بنجاح. شكراً لمساعدتنا في الحفاظ على جودة السوق.', {
                    duration: 5000,
                    icon: '🛡️'
                })
                setIsOpen(false)
                setReason('')
                setDetails('')
            } else {
                toast.error(result.error || 'حدث خطأ غير متوقع')
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <button className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground/80 hover:text-destructive hover:bg-destructive/10 py-2 rounded-lg transition-colors mt-2 cursor-pointer duration-200 group">
                        <Flag size={16} className="group-hover:scale-110 transition-transform duration-200" />
                        <span className="font-medium">إبلاغ عن مخالفة</span>
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle size={20} />
                        إبلاغ عن هذا الإعلان
                    </DialogTitle>
                    <DialogDescription>
                        ساعدنا في الحفاظ على بيئة آمنة للجميع. سيتم مراجعة بلاغك من قبل الإدارة بسرية تامة.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">سبب البلاغ <span className="text-destructive">*</span></label>
                        <div className="grid grid-cols-1 gap-2">
                            {REPORT_REASONS.map((r) => (
                                <label
                                    key={r.value}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50",
                                        reason === r.value ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r.value}
                                        checked={reason === r.value}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm">{r.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">تفاصيل إضافية (اختياري)</label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="اشرح المشكلة بمزيد من التفصيل..."
                            className="w-full min-h-[80px] p-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            disabled={isPending}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || !reason}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
                        >
                            {isPending && <Loader2 size={16} className="animate-spin" />}
                            إرسال البلاغ
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

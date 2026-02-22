'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
    ShieldAlert,
    AlertTriangle,
    Info,
    Trash2,
    ExternalLink,
    User,
    Calendar,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogHeader,
    DialogFooter
} from '@/presentation/ui/dialog'
import { cn } from '@/lib/utils'
import { MarketplaceReport } from '@/actions/marketplace-reports.actions'

interface ReportDetailsDialogProps {
    report: MarketplaceReport | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onStatusUpdate: (id: string, newStatus: string) => void
    onDeleteReport: (id: string) => void
    onDeleteItem: (id: string, itemId: string) => void
    isPending: boolean
}

const STATUS_MAP = {
    pending: { label: 'معلق', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    reviewed: { label: 'تمت المراجعة', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    actioned: { label: 'تم القبول', color: 'bg-green-100 text-green-700 border-green-200' },
    dismissed: { label: 'تم التجاهل', color: 'bg-gray-100 text-gray-700 border-gray-200' }
}

const REASON_MAP: Record<string, string> = {
    scam: 'احتيال ونصب',
    fake: 'منتج مقلد',
    inappropriate: 'محتوى غير لائق',
    misleading_price: 'سعر مضلل',
    duplicate: 'إعلان مكرر',
    wrong_category: 'قسم خاطئ',
    other: 'سبب آخر'
}

export function ReportDetailsDialog({
    report,
    open,
    onOpenChange,
    onStatusUpdate,
    onDeleteReport,
    onDeleteItem,
    isPending
}: ReportDetailsDialogProps) {
    const [deleteItemConfirmOpen, setDeleteItemConfirmOpen] = useState(false)
    const [deleteReportConfirmOpen, setDeleteReportConfirmOpen] = useState(false)

    if (!report) return null

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl overflow-hidden p-0 gap-0 border-none sm:rounded-2xl h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col bg-background/95 backdrop-blur-xl">

                    {/* Header */}
                    <div className="bg-muted/30 p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                        <div>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <ShieldAlert className="text-destructive" size={24} />
                                تفاصيل البلاغ
                            </DialogTitle>
                            <DialogDescription className="mt-1 text-xs sm:text-sm">
                                مراجعة تفاصيل البلاغ واتخاذ الإجراء المناسب.
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={cn("px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5", STATUS_MAP[report.status as keyof typeof STATUS_MAP].color)}>
                                {report.status === 'pending' && <Clock size={12} />}
                                {report.status === 'reviewed' && <Info size={12} />}
                                {report.status === 'actioned' && <CheckCircle size={12} />}
                                {report.status === 'dismissed' && <XCircle size={12} />}
                                {STATUS_MAP[report.status as keyof typeof STATUS_MAP].label}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md border">
                                {new Date(report.created_at).toLocaleDateString('ar-EG')}
                            </span>
                        </div>
                    </div>

                    {/* Body scrollable */}
                    <div className="p-4 sm:p-6 grid lg:grid-cols-2 gap-6 sm:gap-8 overflow-y-auto flex-1">

                        {/* Right Column: Report Info */}
                        <div className="space-y-6">
                            <section>
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Info size={14} /> معلومات البلاغ
                                </h4>
                                <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
                                    <div>
                                        <label className="text-xs text-muted-foreground block mb-1.5">السبب</label>
                                        <div className="font-semibold text-destructive flex items-center gap-2 bg-destructive/5 p-2 rounded-lg border border-destructive/10 w-fit">
                                            <AlertTriangle size={16} />
                                            {REASON_MAP[report.reason] || report.reason}
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 p-3 sm:p-4 rounded-lg border border-border/50">
                                        <label className="text-xs text-muted-foreground block mb-1.5">تفاصيل إضافية</label>
                                        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                                            {report.details || 'لا توجد تفاصيل إضافية'}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-border/50">
                                        <label className="text-xs text-muted-foreground block mb-2">المُبَلِّغ</label>
                                        <div className="flex items-center gap-3 bg-muted/20 p-2 rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20 shrink-0">
                                                {report.reporter?.full_name?.charAt(0) || '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{report.reporter?.full_name || 'مجهول'}</p>
                                                <p className="text-xs text-muted-foreground truncate">{report.reporter?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">إجراءات سريعة</h4>
                                <div className="bg-card border border-border rounded-xl p-2 shadow-sm grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setDeleteReportConfirmOpen(true)}
                                        className="col-span-2 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors border border-transparent hover:border-destructive/20"
                                    >
                                        <Trash2 size={14} />
                                        حذف سجل البلاغ نهائياً
                                    </button>
                                </div>
                            </section>
                        </div>

                        {/* Left Column: Item Info & Actions */}
                        <div className="space-y-6">
                            <section>
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <ExternalLink size={14} /> الإعلان المُبلغ عنه
                                </h4>
                                {report.item ? (
                                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm group hover:shadow-md transition-all duration-300">
                                        {/* Image Area */}
                                        <div className="relative h-48 sm:h-56 bg-muted">
                                            {report.item.images?.[0] ? (
                                                <Image
                                                    src={report.item.images[0]}
                                                    alt=""
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <AlertTriangle size={32} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-4">
                                                <div className="text-white w-full">
                                                    <h3 className="font-bold text-lg leading-tight line-clamp-1 mb-1">{report.item.title}</h3>
                                                    <div className="flex items-center justify-between text-xs text-white/80">
                                                        <span className="flex items-center gap-1"><User size={10} /> {report.item.seller?.full_name || 'غير معروف'}</span>
                                                        <span className="font-bold bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">{report.item.price} ج.م</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Area */}
                                        <div className="p-4 bg-muted/10 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <a
                                                    href={`/marketplace/${report.item.slug || report.target_id}`}
                                                    target="_blank"
                                                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                                >
                                                    <ExternalLink size={14} />
                                                    معاينة
                                                </a>
                                                <button
                                                    onClick={() => setDeleteItemConfirmOpen(true)}
                                                    className="flex items-center justify-center gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                                >
                                                    <Trash2 size={14} />
                                                    حذف الإعلان
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center border-2 border-dashed border-destructive/20 rounded-xl bg-destructive/5 text-destructive">
                                        <Trash2 size={32} className="mx-auto mb-3 opacity-50" />
                                        <h3 className="font-bold text-sm mb-1">الإعلان محذوف</h3>
                                        <p className="text-xs opacity-70">تم حذف هذا الإعلان بالفعل من السوق.</p>
                                    </div>
                                )}
                            </section>

                            <section>
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">تحديث الحالة (للمتابعة)</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {['pending', 'reviewed', 'dismissed'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => onStatusUpdate(report.id, status)}
                                            disabled={report.status === status || isPending}
                                            className={cn(
                                                "py-2.5 px-2 rounded-lg text-xs font-bold border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                                                report.status === status
                                                    ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20 shadow-md transform scale-[1.02]"
                                                    : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {STATUS_MAP[status as keyof typeof STATUS_MAP].label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                                    * تحديث الحالة سيرسل إشعاراً فورياً للمُبلغ.
                                </p>
                            </section>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-4 border-t border-border flex justify-end shrink-0">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="px-8 py-2.5 rounded-lg border bg-background hover:bg-muted transition-colors text-sm font-bold shadow-sm min-w-[100px]"
                        >
                            إغلاق
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Sub-Dialogs: Confirm Delete ITEM */}
            <Dialog open={deleteItemConfirmOpen} onOpenChange={setDeleteItemConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive flex items-center gap-2">
                            <Trash2 size={20} /> تأكيد حذف الإعلان
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            تحذير: هذا الإجراء سيحذف الإعلان نهائياً ويغلق البلاغ بقبوله.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <button onClick={() => setDeleteItemConfirmOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-muted text-sm font-medium">إلغاء</button>
                        <button
                            onClick={() => {
                                if (report.item?.seller_id) { // Ensure safe access
                                    // logic handled by parent via onDeleteItem
                                }
                                onDeleteItem(report.id, report.target_id)
                                setDeleteItemConfirmOpen(false)
                            }}
                            disabled={isPending}
                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 text-sm font-medium"
                        >
                            {isPending ? 'جاري الحذف...' : 'حذف الإعلان'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Sub-Dialogs: Confirm Delete REPORT */}
            <Dialog open={deleteReportConfirmOpen} onOpenChange={setDeleteReportConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive flex items-center gap-2">
                            <Trash2 size={20} /> حذف سجل البلاغ
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            سيتم حذف هذا السجل من القائمة فقط. لن يتأثر الإعلان.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <button onClick={() => setDeleteReportConfirmOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-muted text-sm font-medium">إلغاء</button>
                        <button
                            onClick={() => {
                                onDeleteReport(report.id)
                                setDeleteReportConfirmOpen(false)
                            }}
                            disabled={isPending}
                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 text-sm font-medium"
                        >
                            {isPending ? 'جاري الحذف...' : 'حذف السجل'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MoreVertical, Clock, AlertTriangle, ShieldAlert, User, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { MarketplaceReport, updateReportStatusAction, resolveReportAction, deleteReportAction } from '@/actions/marketplace-reports.actions'
import { cn } from '@/lib/utils'
import { ReportDetailsDialog } from './report-details-dialog'

interface ReportsListProps {
    initialReports: MarketplaceReport[]
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

export function ReportsList({ initialReports }: ReportsListProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Optimistic State
    const [optimisticReports, setOptimisticReports] = useOptimistic(
        initialReports,
        (state, updatedReport: { id: string, status?: string, deleted?: boolean }) => {
            if (updatedReport.deleted) {
                return state.filter(r => r.id !== updatedReport.id)
            }
            return state.map(r => r.id === updatedReport.id
                ? { ...r, status: updatedReport.status as any }
                : r
            )
        }
    )

    const [selectedReport, setSelectedReport] = useState<MarketplaceReport | null>(null)
    const [viewDetailsOpen, setViewDetailsOpen] = useState(false)

    // Derived state for the selected report to reflect optimistic changes instantly in the dialog too
    const activeReport = optimisticReports.find(r => r.id === selectedReport?.id) || selectedReport

    const handleStatusUpdate = (id: string, newStatus: string) => {
        startTransition(async () => {
            // Optimistic update immediately inside the transition
            setOptimisticReports({ id, status: newStatus })

            const result = await updateReportStatusAction(id, newStatus)
            if (result.success) {
                toast.success('تم تحديث الحالة وإشعار المستخدم')
                router.refresh()
            } else {
                toast.error(result.error || 'حدث خطأ')
                // Revert is handled by Next.js revalidation, but for optimistic UI ideally we revert state if fail.
                // Here we rely on router.refresh() to sync eventually.
            }
        })
    }

    const handleResolve = (id: string, itemId: string, action: 'delete_item' | 'dismiss_report') => {
        startTransition(async () => {
            // If deleting item, we usually change status to 'actioned'
            if (action === 'delete_item') {
                setOptimisticReports({ id, status: 'actioned' })
            } else {
                setOptimisticReports({ id, status: 'dismissed' })
            }

            const result = await resolveReportAction(id, itemId, action)
            if (result.success) {
                toast.success(action === 'delete_item' ? 'تم حذف الإعلان وإغلاق البلاغ' : 'تم تجاهل البلاغ')
                router.refresh()
                setViewDetailsOpen(false)
            } else {
                toast.error(result.error || 'حدث خطأ')
            }
        })
    }

    const handleDeleteReport = (id: string) => {
        startTransition(async () => {
            setOptimisticReports({ id, deleted: true })
            const result = await deleteReportAction(id)
            if (result.success) {
                toast.success('تم حذف سجل البلاغ نهائياً')
                router.refresh()
                setViewDetailsOpen(false)
            } else {
                toast.error(result.error || 'حدث خطأ')
            }
        })
    }

    if (optimisticReports.length === 0) {
        return (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/60">
                <div className="bg-background w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
                    <ShieldAlert className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">لا توجد بلاغات حالياً</h3>
                <p className="text-muted-foreground">السوق نظيف وآمن! 🎉</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Desktop Table - Hidden on Mobile */}
            <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <table className="w-full text-right">
                    <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        <tr>
                            <th className="px-6 py-4">الإعلان</th>
                            <th className="px-6 py-4">سبب البلاغ</th>
                            <th className="px-6 py-4">المُبَلِّغ</th>
                            <th className="px-6 py-4">الحالة</th>
                            <th className="px-6 py-4 w-[50px]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {optimisticReports.map((report) => (
                            <tr
                                key={report.id}
                                className="hover:bg-muted/20 transition-colors group cursor-pointer"
                                onClick={() => { setSelectedReport(report); setViewDetailsOpen(true) }}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 bg-muted rounded-lg overflow-hidden shrink-0 border border-border">
                                            {report.item?.images?.[0] ? (
                                                <Image src={report.item.images[0]} alt="" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <AlertTriangle size={16} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="max-w-[200px]">
                                            {report.item ? (
                                                <div className="font-medium text-sm truncate" title={report.item.title}>
                                                    {report.item.title}
                                                </div>
                                            ) : (
                                                <span className="text-destructive text-sm font-medium italic">إعلان محذوف</span>
                                            )}
                                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                                <Calendar size={10} />
                                                {new Date(report.created_at).toLocaleDateString('ar-EG')}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium">{REASON_MAP[report.reason] || report.reason}</div>
                                    {report.details && (
                                        <p className="text-xs text-muted-foreground max-w-[180px] truncate mt-1">
                                            {report.details}
                                        </p>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                            {report.reporter?.full_name?.charAt(0) || '?'}
                                        </div>
                                        <span className="truncate max-w-[120px]">{report.reporter?.full_name || 'مجهول'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border", STATUS_MAP[report.status as keyof typeof STATUS_MAP]?.color)}>
                                        {STATUS_MAP[report.status as keyof typeof STATUS_MAP]?.label}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards - Visible on Mobile */}
            <div className="md:hidden grid grid-cols-1 gap-4">
                {optimisticReports.map((report) => (
                    <div
                        key={report.id}
                        className="bg-card p-4 rounded-xl border border-border shadow-sm active:scale-[0.99] transition-transform cursor-pointer"
                        onClick={() => { setSelectedReport(report); setViewDetailsOpen(true) }}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border", STATUS_MAP[report.status as keyof typeof STATUS_MAP]?.color)}>
                                    {STATUS_MAP[report.status as keyof typeof STATUS_MAP]?.label}
                                </span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock size={10} />
                                    {new Date(report.created_at).toLocaleDateString('ar-EG')}
                                </span>
                            </div>
                            <MoreVertical size={16} className="text-muted-foreground" />
                        </div>

                        <div className="flex gap-3 mb-3">
                            <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0 border border-border">
                                {report.item?.images?.[0] ? (
                                    <Image src={report.item.images[0]} alt="" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        <AlertTriangle size={20} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm line-clamp-1 mb-1">{report.item?.title || 'إعلان محذوف'}</h4>
                                <div className="text-xs text-destructive font-medium flex items-center gap-1.5 bg-destructive/5 px-2 py-1 rounded-md w-fit border border-destructive/10">
                                    <AlertTriangle size={12} />
                                    {REASON_MAP[report.reason] || report.reason}
                                </div>
                            </div>
                        </div>

                        {report.details && (
                            <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded-lg mb-3 border border-border/50 italic">
                                "{report.details}"
                            </p>
                        )}

                        <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <User size={12} />
                                <span>{report.reporter?.full_name || 'مجهول'}</span>
                            </div>
                            <div className="text-xs font-medium text-primary">
                                عرض التفاصيل
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reusable Dialog Component */}
            <ReportDetailsDialog
                report={activeReport}
                open={viewDetailsOpen}
                onOpenChange={setViewDetailsOpen}
                onStatusUpdate={handleStatusUpdate}
                onDeleteReport={handleDeleteReport}
                onDeleteItem={(reportId, itemId) => handleResolve(reportId, itemId, 'delete_item')}
                isPending={isPending}
            />
        </div>
    )
}

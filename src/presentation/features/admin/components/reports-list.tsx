'use client'

import { useState, useTransition } from 'react'
import { Flag, Shield, AlertTriangle, Clock, User, ExternalLink, Info, CheckCircle, XCircle, MoreVertical, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateReportStatusAction } from '@/actions/admin-audit.actions'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

interface Props {
    marketplaceReports: any[]
    auditLogs: any[]
}

type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';

export function ReportsList({ marketplaceReports, auditLogs }: Props) {
    const [tab, setTab] = useState<'reports' | 'logs'>('reports')
    const [isPending, startTransition] = useTransition()
    const searchParams = useSearchParams()
    const router = useRouter()

    const statusFilter = searchParams.get('status') || 'pending'

    useEffect(() => {
        const t = searchParams.get('tab')
        if (t === 'logs' || t === 'reports') setTab(t)
    }, [searchParams])

    const handleStatusChange = (newStatus: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('status', newStatus)
        router.push(`/admin/reports?${params.toString()}`)
    }

    const handleUpdateStatus = async (reportId: string, newStatus: ReportStatus) => {
        startTransition(async () => {
            const result = await updateReportStatusAction(reportId, newStatus)
            if (result.success) {
                toast.success('تم تحديث حالة البلاغ بنجاح')
            } else {
                toast.error('فشل في تحديث حالة البلاغ: ' + result.error)
            }
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return "bg-amber-50 text-amber-600 border-amber-100"
            case 'reviewed': return "bg-blue-50 text-blue-600 border-blue-100"
            case 'actioned': return "bg-green-50 text-green-600 border-green-100"
            case 'dismissed': return "bg-slate-50 text-slate-600 border-slate-100"
            default: return "bg-muted text-muted-foreground"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return "قيد الانتظار"
            case 'reviewed': return "تمت المراجعة"
            case 'actioned': return "تم اتخاذ إجراء"
            case 'dismissed': return "تم التجاهل"
            default: return status
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex border-b border-border">
                <button
                    onClick={() => setTab('reports')}
                    className={cn(
                        "px-6 py-3 text-sm font-bold border-b-2 transition-colors",
                        tab === 'reports' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    البلاغات ({marketplaceReports.length})
                </button>
                <button
                    onClick={() => setTab('logs')}
                    className={cn(
                        "px-6 py-3 text-sm font-bold border-b-2 transition-colors",
                        tab === 'logs' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    سجلات العمليات ({auditLogs.length})
                </button>
            </div>

            <div className="flex items-center justify-between">
                {tab === 'reports' ? (
                    <div className="flex flex-wrap gap-2 pb-2">
                        {(['all', 'pending', 'reviewed', 'actioned', 'dismissed'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => handleStatusChange(s)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                                    statusFilter === s
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                                )}
                            >
                                {s === 'all' ? 'الكل' : getStatusLabel(s)}
                                {s === 'pending' && marketplaceReports.filter(r => r.status === 'pending').length > 0 && (
                                    <span className="mr-1.5 px-1.5 py-0.5 bg-amber-500 text-[10px] text-white rounded-full">
                                        {marketplaceReports.filter(r => r.status === 'pending').length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-between w-full">
                        <div className="text-xs font-bold text-muted-foreground">آخر {auditLogs.length} عملية مسجلة</div>
                        <button
                            onClick={() => {
                                const csv = [
                                    ['ID', 'User', 'Action', 'Table', 'Date', 'IP'].join(','),
                                    ...auditLogs.map(log => [
                                        log.id,
                                        `"${log.profiles?.full_name || 'Unknown'}"`,
                                        log.action,
                                        log.table_name,
                                        new Date(log.created_at).toISOString(),
                                        log.ip_address || 'N/A'
                                    ].join(','))
                                ].join('\n')
                                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                                const link = document.createElement('a')
                                link.href = URL.createObjectURL(blob)
                                link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`)
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 transition-all"
                        >
                            تصدير إلى CSV
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {tab === 'reports' ? (
                    marketplaceReports.length === 0 ? (
                        <div className="py-12 text-center bg-muted/20 rounded-xl border border-dashed">
                            <p className="text-muted-foreground">لا توجد بلاغات تطابق البحث.</p>
                        </div>
                    ) : (
                        marketplaceReports.map((report) => (
                            <div key={report.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border",
                                                getStatusColor(report.status)
                                            )}>
                                                {getStatusLabel(report.status)}
                                            </div>
                                            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                                                <AlertTriangle size={14} />
                                                {report.reason}
                                            </div>
                                        </div>

                                        <h3 className="font-bold flex items-center gap-2 text-lg">
                                            إبلاغ عن: {report.item?.title || 'عنصر غير موجود'}
                                            {report.item?.slug && (
                                                <a href={`/marketplace/item/${report.item.slug}`} target="_blank" className="text-primary hover:text-primary/80 transition-colors">
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                        </h3>

                                        <p className="text-sm text-foreground bg-muted/30 p-4 rounded-lg border border-border/50">
                                            <Info size={14} className="inline-block ml-2 text-muted-foreground" />
                                            {report.details || 'بدون تفاصيل إضافية'}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded">
                                                <User size={14} /> المُبلغ: {report.reporter?.full_name || 'مجهول'}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded">
                                                <Clock size={14} /> {new Date(report.created_at).toLocaleString('ar-EG')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                                        {report.status === 'pending' && (
                                            <>
                                                <button
                                                    disabled={isPending}
                                                    onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                                                    className="flex-1 md:w-32 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Clock size={14} /> تم الاطلاع
                                                </button>
                                                <button
                                                    disabled={isPending}
                                                    onClick={() => handleUpdateStatus(report.id, 'actioned')}
                                                    className="flex-1 md:w-32 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle size={14} /> اتخاذ إجراء
                                                </button>
                                            </>
                                        )}
                                        {report.status !== 'dismissed' && (
                                            <button
                                                disabled={isPending}
                                                onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                                                className="flex-1 md:w-32 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={14} /> تجاهل
                                            </button>
                                        )}
                                        {report.status !== 'pending' && (
                                            <button
                                                disabled={isPending}
                                                onClick={() => handleUpdateStatus(report.id, 'pending')}
                                                className="flex-1 md:w-32 bg-background text-muted-foreground hover:bg-muted border border-border px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                                            >
                                                إعادة كـ "معلق"
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    <div className="space-y-2">
                        {auditLogs.length === 0 ? (
                            <div className="py-12 text-center bg-muted/20 rounded-xl border border-dashed">
                                <p className="text-muted-foreground">لا توجد سجلات حالياً.</p>
                            </div>
                        ) : (
                            auditLogs.map((log) => (
                                <div key={log.id} className="bg-card border border-border rounded-lg p-4 text-xs flex items-center justify-between hover:bg-muted/30 transition-all border-r-4 border-r-primary/20">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                                            log.severity === 'critical' ? "bg-rose-100 text-rose-600" :
                                                log.severity === 'warning' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                                        )}>
                                            <Shield size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-foreground text-sm">
                                                {log.profiles?.full_name || 'مستخدم غير معروف'} قام بـ: <span className="text-primary font-mono">{log.action}</span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-3">
                                                <span className="flex items-center gap-1"><Info size={10} /> {log.table_name}</span>
                                                <span className="flex items-center gap-1"><Clock size={10} /> {new Date(log.created_at).toLocaleString('ar-EG')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-mono bg-muted/80 px-3 py-1 rounded-full border border-border/50">
                                        {log.ip_address || 'Internal'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

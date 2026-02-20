'use client'

import { useState } from 'react'
import { Flag, Shield, AlertTriangle, Clock, User, ExternalLink, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
    marketplaceReports: any[]
    auditLogs: any[]
}

export function ReportsList({ marketplaceReports, auditLogs }: Props) {
    const [tab, setTab] = useState<'reports' | 'logs'>('reports')

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
                    بلاغات الماركت ({marketplaceReports.length})
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

            <div className="space-y-4">
                {tab === 'reports' ? (
                    marketplaceReports.length === 0 ? (
                        <div className="py-12 text-center bg-muted/20 rounded-xl border border-dashed">
                            <p className="text-muted-foreground">لا توجد بلاغات حالياً.</p>
                        </div>
                    ) : (
                        marketplaceReports.map((report) => (
                            <div key={report.id} className="bg-card border border-border rounded-xl p-5 shadow-sm">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                                            <AlertTriangle size={14} />
                                            {report.reason}
                                        </div>
                                        <h3 className="font-bold flex items-center gap-2">
                                            إبلاغ عن: {report.item?.title}
                                            <a href={`/marketplace/item/${report.item?.slug}`} target="_blank" className="text-primary hover:underline">
                                                <ExternalLink size={14} />
                                            </a>
                                        </h3>
                                        <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg italic">"{report.details || 'بدون تفاصيل إضافية'}"</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><User size={14} /> {report.reporter?.full_name}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(report.created_at).toLocaleString('ar-EG')}</span>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <div className={cn(
                                            "text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border",
                                            report.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-green-50 text-green-600 border-green-100"
                                        )}>
                                            {report.status}
                                        </div>
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
                                <div key={log.id} className="bg-card border border-border rounded-lg p-3 text-xs flex items-center justify-between hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-8 h-8 rounded flex items-center justify-center shrink-0",
                                            log.severity === 'critical' ? "bg-rose-100 text-rose-600" :
                                                log.severity === 'warning' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                                        )}>
                                            <Shield size={16} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-foreground">
                                                {log.profiles?.full_name} قام بـ: <span className="text-primary">{log.action}</span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground mt-0.5">
                                                {log.table_name} — {new Date(log.created_at).toLocaleString('ar-EG')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
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

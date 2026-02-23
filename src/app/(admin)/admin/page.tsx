import Link from 'next/link'
import { Package, MessageSquare, Key, Users, Flag, TrendingUp, Activity } from 'lucide-react'
import { getAdminStatsAction } from '@/actions/admin-marketplace.actions'
import { getFlaggedQuestionsAction, getFlaggedAnswersAction } from '@/actions/admin-community.actions'
import { getPendingClaimsAction } from '@/actions/admin-claims.actions'
import { getAdminPlacesAction } from '@/actions/admin-places.actions'
import { getDashboardGrowthAction } from '@/actions/admin-dashboard.actions'
import { getAuditLogsAction } from '@/actions/admin-audit.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/ui/card'
import { MapPin } from 'lucide-react'
import { requireSuperAdmin } from '@/lib/supabase/auth-utils'
import { GrowthChart } from '@/presentation/features/admin/components/growth-chart'
import { Avatar, AvatarFallback } from '@/presentation/ui/avatar'
import { cn } from '@/lib/utils'

export default async function AdminDashboardPage() {
    await requireSuperAdmin()

    const [
        statsResult,
        flaggedQ,
        flaggedA,
        pendingClaims,
        placesResult,
        growthRes,
        logsRes
    ] = await Promise.all([
        getAdminStatsAction(),
        getFlaggedQuestionsAction(),
        getFlaggedAnswersAction(),
        getPendingClaimsAction(),
        getAdminPlacesAction({ status: 'pending' }),
        getDashboardGrowthAction(),
        getAuditLogsAction({ limit: 10 })
    ])

    const stats = statsResult.stats
    const communityCount = (flaggedQ.questions?.length || 0) + (flaggedA.answers?.length || 0)
    const claimsCount = pendingClaims.claims?.length || 0
    const growth = growthRes.stats
    const logs = logsRes.logs || []

    const dashboardCards = [
        { title: 'إعلانات للمراجعة', value: stats?.totalPending || 0, icon: Package, color: 'text-amber-500', bg: 'bg-amber-50' },
        { title: 'أماكن للمراجعة', value: (placesResult.places?.length || 0), icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { title: 'بلاغات الماركت', value: stats?.totalReports || 0, icon: Flag, color: 'text-rose-500', bg: 'bg-rose-50' },
        { title: 'بلاغات المجتمع', value: communityCount, icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' }
    ]

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-foreground">لوحة التحكم السريعة</h1>
                    <p className="text-muted-foreground mt-1 font-medium">نظرة عامة على أداء الموقع والتنبيهات التي تحتاج لتدخل سريع.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-xl border border-border">
                    <Activity size={14} className="text-primary animate-pulse" />
                    تحديث مباشر
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardCards.map((card) => (
                    <Card key={card.title} className="group hover:shadow-xl transition-all duration-300 border-none bg-card shadow-md relative overflow-hidden">
                        <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-2xl opacity-10 transition-transform group-hover:scale-110", card.color.replace('text', 'bg'))} />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-wider">{card.title}</CardTitle>
                            <div className={cn("p-2 rounded-xl", card.bg)}>
                                <card.icon className={card.color} size={20} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-foreground tabular-nums">{card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <div className="lg:col-span-2">
                    <GrowthChart
                        data={growth?.chartData || []}
                        title="نمو المستخدمين الجدد"
                    />
                </div>

                {/* Recent Activity */}
                <Card className="border-none shadow-md overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-border bg-muted/10 h-[72px] flex items-center shrink-0">
                        <CardTitle className="text-sm font-black flex items-center gap-2 mt-2">
                            <TrendingUp size={18} className="text-primary" />
                            سجل العمليات الأخير
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto max-h-[400px]">
                        <div className="divide-y divide-border">
                            {logs.length === 0 ? (
                                <div className="p-12 text-center text-xs text-muted-foreground font-medium">
                                    لا يوجد نشاط مسجل حالياً.
                                </div>
                            ) : (
                                logs.map((log: any) => (
                                    <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[10px] font-black text-primary uppercase">{log.action || 'عملية'}</div>
                                            <div className="text-[9px] text-muted-foreground font-medium">
                                                {new Date(log.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold text-foreground line-clamp-1">
                                            {log.profiles?.full_name || 'مستخدم غير معروف'} قام بـ {log.action}
                                        </div>
                                        {log.table_name && (
                                            <div className="text-[9px] text-muted-foreground font-mono">
                                                المسار: {log.table_name}/{log.record_id?.substring(0, 8)}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                    <div className="p-3 border-t border-border bg-muted/5 text-center shrink-0">
                        <Link href="/admin/reports?tab=logs" className="text-[10px] font-black text-primary hover:underline">عرض جميع السجلات</Link>
                    </div>
                </Card>
            </div>
        </div>
    )
}

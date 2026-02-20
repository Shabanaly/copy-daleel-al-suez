import { Package, MessageSquare, Key, Users, Flag, TrendingUp } from 'lucide-react'
import { getAdminStatsAction } from '@/actions/admin-marketplace.actions'
import { getFlaggedQuestionsAction, getFlaggedAnswersAction } from '@/actions/admin-community.actions'
import { getPendingClaimsAction } from '@/actions/admin-claims.actions'
import { getAdminPlacesAction } from '@/actions/admin-places.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/ui/card'
import { MapPin } from 'lucide-react'
import { requireSuperAdmin } from '@/lib/supabase/auth-utils'

export default async function AdminDashboardPage() {
    await requireSuperAdmin()

    const [statsResult, flaggedQ, flaggedA, pendingClaims, placesResult] = await Promise.all([
        getAdminStatsAction(),
        getFlaggedQuestionsAction(),
        getFlaggedAnswersAction(),
        getPendingClaimsAction(),
        getAdminPlacesAction({ status: 'pending' })
    ])

    const stats = statsResult.stats
    const communityCount = (flaggedQ.questions?.length || 0) + (flaggedA.answers?.length || 0)
    const claimsCount = pendingClaims.claims?.length || 0

    const dashboardCards = [
        { title: 'إعلانات بانتظار المراجعة', value: stats?.totalPending || 0, icon: Package, color: 'text-amber-500' },
        { title: 'أماكن بانتظار المراجعة', value: (placesResult.places?.length || 0), icon: MapPin, color: 'text-emerald-500' },
        { title: 'بلاغات الماركت', value: stats?.totalReports || 0, icon: Flag, color: 'text-rose-500' },
        { title: 'بلاغات المجتمع', value: communityCount, icon: MessageSquare, color: 'text-blue-500' },
        { title: 'طلبات التوثيق', value: claimsCount, icon: Key, color: 'text-purple-500' },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">ملخص النظام</h1>
                <p className="text-muted-foreground mt-1">نظرة عامة على حالة الموقع والطلبات المعلقة.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardCards.map((card) => (
                    <Card key={card.title} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <card.icon className={card.color} size={20} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Placeholder for Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" />
                        النشاط الأخير
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-40 flex items-center justify-center text-muted-foreground border-t border-dashed border-border mt-2 pt-4">
                        سيتم عرض سجلات النشاط (Logs) هنا قريباً...
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

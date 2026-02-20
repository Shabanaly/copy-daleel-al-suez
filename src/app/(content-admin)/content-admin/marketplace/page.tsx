import { getAdminStatsAction, getPendingItemsAction } from '@/actions/admin-marketplace.actions'
import { AdminDashboard } from '@/presentation/components/marketplace/admin/admin-dashboard'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ContentAdminMarketplacePage() {
    const [statsResult, pendingResult] = await Promise.all([
        getAdminStatsAction(),
        getPendingItemsAction(),
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/content-admin" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <ArrowRight size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">إدارة سوق السويس</h1>
                    <p className="text-muted-foreground mt-0.5 text-sm">مراجعة الإعلانات والتحكم في المحتوى الترويجي</p>
                </div>
            </div>
            <AdminDashboard
                stats={statsResult.stats}
                pendingItems={pendingResult.items || []}
                error={statsResult.error || pendingResult.error}
            />
        </div>
    )
}

import { getPendingClaimsAction } from '@/actions/admin-claims.actions'
import { BusinessClaimsList } from '@/presentation/features/admin/components'
import { Key, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ContentAdminClaimsPage() {
    const result = await getPendingClaimsAction()
    const claims = result.claims || []

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/content-admin" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <ArrowRight size={18} />
                </Link>
                <div className="flex-1 flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">طلبات التوثيق</h1>
                        <p className="text-muted-foreground mt-0.5 text-sm">مراجعة مستندات إثبات الملكية وتحويل صياغة الأماكن</p>
                    </div>
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold border border-primary/20 flex items-center gap-2">
                        <Key size={16} />
                        {claims.length} طلبات معلقة
                    </div>
                </div>
            </div>
            <BusinessClaimsList pendingClaims={claims} />
        </div>
    )
}

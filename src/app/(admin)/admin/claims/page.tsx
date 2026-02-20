import { getPendingClaimsAction } from '@/actions/admin-claims.actions'
import { BusinessClaimsList } from '@/presentation/features/admin/components'
import { Key } from 'lucide-react'

export default async function AdminClaimsPage() {
    const result = await getPendingClaimsAction()
    const claims = result.claims || []

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">توثيق المحلات</h1>
                    <p className="text-muted-foreground mt-1">مراجعة مستندات إثبات الملكية وتحويل صياغة الأماكن لأصحابها.</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold border border-primary/20 flex items-center gap-2">
                    <Key size={16} />
                    {claims.length} طلبات معلقة
                </div>
            </div>

            <BusinessClaimsList pendingClaims={claims} />
        </div>
    )
}

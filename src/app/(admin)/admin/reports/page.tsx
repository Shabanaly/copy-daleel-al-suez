import { getMarketplaceReportsAction, getAuditLogsAction } from '@/actions/admin-audit.actions'
import { ReportsList } from '@/presentation/features/admin/components'
import { Flag } from 'lucide-react'
import { requireSuperAdmin } from '@/lib/supabase/auth-utils'

export default async function AdminReportsPage() {
    await requireSuperAdmin()
    const [reportsResult, logsResult] = await Promise.all([
        getMarketplaceReportsAction(),
        getAuditLogsAction()
    ])

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">البلاغات والنشاط</h1>
                    <p className="text-muted-foreground mt-1">مراقبة بلاغات المستخدمين وسجلات العمليات الإدارية.</p>
                </div>
            </div>

            <ReportsList
                marketplaceReports={reportsResult.reports || []}
                auditLogs={logsResult.logs || []}
            />
        </div>
    )
}

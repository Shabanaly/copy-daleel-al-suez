import { requireAdmin } from '@/lib/supabase/auth-utils'
import { AdminDesktopSidebar, AdminMobileDrawerTrigger } from '@/presentation/components/shared/layout/admin-sidebar-shell'
import { Breadcrumbs } from '@/presentation/components/ui/Breadcrumbs'
import { GlobalAdminSearch } from '@/presentation/features/admin/components/global-search'
import { getPendingCountsAction } from '@/actions/admin-dashboard.actions'
import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    try {
        const { profile } = await requireAdmin()

        if (profile?.role !== 'super_admin') {
            redirect('/content-admin')
        }

        const countsRes = await getPendingCountsAction()
        const pendingCounts = countsRes.counts || { reports: 0, claims: 0, places: 0, marketplace: 0 }

        const subtitle = 'مدير النظام'
        const variant = 'super-admin'
        const isSuperAdmin = true

        return (
            <div className="flex min-h-screen bg-muted/30" dir="rtl">
                {/* Desktop Sidebar */}
                <AdminDesktopSidebar
                    variant={variant}
                    subtitle={subtitle}
                    isSuperAdmin={isSuperAdmin}
                    pendingCounts={pendingCounts}
                />

                {/* Main Column */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Mobile-only header */}
                    <header className="lg:hidden h-14 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 flex-shrink-0">
                        <div>
                            <p className="text-sm font-black text-foreground">لوحة التحكم</p>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none">{subtitle}</p>
                        </div>
                        <AdminMobileDrawerTrigger
                            variant={variant}
                            subtitle={subtitle}
                            isSuperAdmin={isSuperAdmin}
                            pendingCounts={pendingCounts}
                        />
                    </header>

                    <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <Breadcrumbs items={[]} />
                            <GlobalAdminSearch />
                        </div>
                        {children}
                    </main>
                </div>
            </div>
        )
    } catch {
        redirect('/')
    }
}

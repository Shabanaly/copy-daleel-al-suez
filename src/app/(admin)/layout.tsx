import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/supabase/auth-utils'
import { AdminDesktopSidebar, AdminMobileDrawerTrigger } from '@/presentation/components/shared/layout/admin-sidebar-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    try {
        const { profile } = await requireAdmin()
        const isSuperAdmin = profile?.role === 'super_admin'
        const subtitle = isSuperAdmin ? 'مدير النظام' : 'مشرف محتوى'
        const variant = isSuperAdmin ? 'super-admin' : 'content-admin'

        return (
            <div className="flex min-h-screen bg-muted/30" dir="rtl">
                {/* Desktop Sidebar */}
                <AdminDesktopSidebar variant={variant} subtitle={subtitle} isSuperAdmin={isSuperAdmin} />

                {/* Main Column */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Mobile-only header */}
                    <header className="lg:hidden h-14 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 flex-shrink-0">
                        <div>
                            <p className="text-sm font-black text-foreground">لوحة التحكم</p>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none">{subtitle}</p>
                        </div>
                        <AdminMobileDrawerTrigger variant={variant} subtitle={subtitle} isSuperAdmin={isSuperAdmin} />
                    </header>

                    <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
                        {children}
                    </main>
                </div>
            </div>
        )
    } catch {
        redirect('/')
    }
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDesktopSidebar, AdminMobileDrawerTrigger } from '@/presentation/components/shared/layout/admin-sidebar-shell'

export default async function ContentAdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
        redirect('/')
    }

    const subtitle = profile.role === 'super_admin' ? 'مدير النظام' : 'مشرف محتوى'
    const isSuperAdmin = profile.role === 'super_admin'

    return (
        <div className="flex min-h-screen bg-muted/30" dir="rtl">
            {/* Desktop Sidebar */}
            <AdminDesktopSidebar variant="content-admin" subtitle={subtitle} isSuperAdmin={isSuperAdmin} />

            {/* Main Column */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile-only header */}
                <header className="lg:hidden h-14 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 flex-shrink-0">
                    <div>
                        <p className="text-sm font-black text-foreground">إدارة المحتوى</p>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none">{subtitle}</p>
                    </div>
                    <AdminMobileDrawerTrigger variant="content-admin" subtitle={subtitle} isSuperAdmin={isSuperAdmin} />
                </header>

                <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}

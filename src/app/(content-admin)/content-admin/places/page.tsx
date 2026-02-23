import { getAdminPlacesAction } from '@/actions/admin-places.actions'
import { getCategoriesUseCase } from '@/di/modules'
import { createClient } from '@/lib/supabase/server'
import { PlacesManagement } from '@/presentation/features/admin/components/places-management'
import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'
import { requireAdmin } from '@/lib/supabase/auth-utils'

export const dynamic = 'force-dynamic'

export default async function AdminPlacesPage() {
    const supabase = await createClient()

    const [placesResult, categories, { profile }] = await Promise.all([
        getAdminPlacesAction(),
        getCategoriesUseCase.execute(undefined, supabase),
        requireAdmin()
    ])

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/content-admin" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <ArrowRight size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">إدارة دليل الأماكن</h1>
                        <p className="text-muted-foreground mt-0.5 text-sm">مراجعة والتحكم في المحلات والخدمات المسجلة</p>
                    </div>
                </div>

                <Link
                    href="/places/new"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                >
                    <Plus size={18} />
                    <span>إضافة مكان جديد</span>
                </Link>
            </div>

            <PlacesManagement
                initialPlaces={placesResult.places || []}
                categories={categories.map(c => ({ id: c.id, name: c.name }))}
                isSuperAdmin={profile?.role === 'super_admin'}
            />
        </div>
    )
}

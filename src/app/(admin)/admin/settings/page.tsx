import { getAdminSettingsAction } from '@/actions/admin-settings.actions'
import { SystemSettingsForm } from '@/presentation/features/admin/components'
import { Settings } from 'lucide-react'
import { requireSuperAdmin } from '@/lib/supabase/auth-utils'

export default async function AdminSettingsPage() {
    await requireSuperAdmin()
    const result = await getAdminSettingsAction()
    const settings = result.settings || []

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">إعدادات النظام</h1>
                <p className="text-muted-foreground mt-1">التحكم في الهوية البصرية، نصوص الموقع، وإعدادات التشغيل الأساسية.</p>
            </div>

            <SystemSettingsForm initialSettings={settings} />
        </div>
    )
}

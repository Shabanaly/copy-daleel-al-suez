import { Metadata } from 'next'
import { getAdminAdsAction } from '@/actions/admin-ads.actions'
import { AdsManagement } from '@/presentation/features/admin/components/ads-management'
import { Breadcrumbs } from '@/presentation/components/ui/Breadcrumbs'
import { Megaphone } from 'lucide-react'

export const metadata: Metadata = {
    title: 'إدارة الإعلانات والترويج | سوبر أدمن',
}

export default async function AdminAdsPage() {
    const adsResult = await getAdminAdsAction()
    const ads = adsResult.data || []

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                        <Megaphone className="text-primary" />
                        مدير الإعلانات والترويج
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium">لوحة التحكم المركزية لإدارة بانرات الموقع، الخصومات، وإعلانات جوجل AdSense.</p>
                </div>
            </div>

            <AdsManagement initialAds={ads} />
        </div>
    )
}

import { Metadata } from 'next'
import { getAdminAdsAction } from '@/actions/admin-ads.actions'
import { AdsManagement } from '@/presentation/features/admin/components/ads-management'
import { Breadcrumbs } from '@/presentation/components/ui/Breadcrumbs'
import { Megaphone } from 'lucide-react'

export const metadata: Metadata = {
    title: 'إدارة الإعلانات والترويج | دليل السويس',
}

export default async function ContentAdminAdsPage() {
    const adsResult = await getAdminAdsAction()
    const ads = adsResult.data || []

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                        <Megaphone className="text-primary" />
                        مدير الإعلانات الشامل
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium">إضافة وتعديل عروض الأماكن، إعلانات البنرات، ومساحات AdSense وربطها بالموقع.</p>
                </div>
            </div>

            <AdsManagement initialAds={ads} />
        </div>
    )
}

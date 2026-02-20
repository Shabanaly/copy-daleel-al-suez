import { getExploreLocationsAction } from '@/actions/explore-map.actions'
import { Map } from '@/presentation/components/maps'
import { MapPin, Info, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function ExploreMapPage() {
    const result = await getExploreLocationsAction()
    const locations = result.locations || []

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            {/* Header Control */}
            <div className="bg-background border-b border-border p-4 flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <MapPin className="text-primary" />
                        خريطة السويس التفاعلية
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">اكتشف المحلات والخدمات حولك في مدينة السويس</p>
                </div>
                <Link href="/search" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                    العودة للقائمة
                    <ArrowRight size={16} />
                </Link>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative">
                <Map
                    height="100%"
                    zoom={14}
                    markers={locations}
                />

                {/* Stats Overlay */}
                <div className="absolute top-4 right-4 z-[400] bg-background/90 backdrop-blur-md p-3 rounded-xl border border-border shadow-lg max-w-[200px]" dir="rtl">
                    <div className="flex items-center gap-2 mb-2">
                        <Info size={14} className="text-primary" />
                        <span className="text-xs font-bold font-mono">الإحصائيات الجغرافية</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">إجمالي المواقع:</span>
                            <span className="font-bold">{locations.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

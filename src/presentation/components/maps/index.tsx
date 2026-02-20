'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/presentation/components/ui/skeleton'

/**
 * Dynamic import for LeafletMap to avoid window is not defined error during SSR
 */
export const Map = dynamic(
    () => import('./leaflet-map'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[400px] bg-muted animate-pulse rounded-xl flex items-center justify-center" >
                <p className="text-muted-foreground text-sm font-medium"> جاري تحميل الخريطة...</p>
            </div>
        )
    }
)

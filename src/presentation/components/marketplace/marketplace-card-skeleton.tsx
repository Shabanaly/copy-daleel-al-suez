import { Skeleton } from "@/presentation/components/ui/skeleton"

interface MarketplaceCardSkeletonProps {
    viewMode?: 'grid' | 'list';
}

export function MarketplaceCardSkeleton({ viewMode = 'grid' }: MarketplaceCardSkeletonProps) {
    if (viewMode === 'list') {
        return (
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-4 animate-pulse">
                <Skeleton className="w-32 h-32 rounded-xl flex-shrink-0" />
                <div className="flex-1 py-1 space-y-3">
                    <div className="flex justify-between items-start">
                        <Skeleton className="h-5 w-3/4 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-1/4 rounded-md" />
                    <div className="flex gap-2 mt-auto">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        <Skeleton className="h-6 w-24 rounded-md" />
                        <Skeleton className="h-4 w-20 rounded-md" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-pulse">
            {/* Image Skeleton - Rectangular 4:3 */}
            <div className="relative aspect-[4/3] bg-gray-200">
                <Skeleton className="w-full h-full" />
                <div className="absolute top-2 left-2">
                    <Skeleton className="w-7 h-7 rounded-sm" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="p-3 flex flex-col flex-1">
                {/* Price */}
                <Skeleton className="h-5 w-24 rounded-sm mb-2" />

                {/* Title */}
                <div className="space-y-1.5 mb-3">
                    <Skeleton className="h-4 w-full rounded-sm" />
                    <Skeleton className="h-4 w-2/3 rounded-sm" />
                </div>

                {/* Bottom Info: Location & Time */}
                <div className="mt-auto flex items-center justify-between pt-2">
                    <Skeleton className="h-3 w-16 rounded-sm" />
                    <Skeleton className="h-3 w-10 rounded-sm" />
                </div>
            </div>
        </div>
    )
}

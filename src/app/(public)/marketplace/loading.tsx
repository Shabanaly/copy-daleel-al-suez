import { MarketplaceCardSkeleton } from "@/presentation/components/marketplace/marketplace-card-skeleton";

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <MarketplaceCardSkeleton key={i} viewMode="grid" />
                ))}
            </div>
        </div>
    );
}

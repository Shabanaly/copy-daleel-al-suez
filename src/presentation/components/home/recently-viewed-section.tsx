'use client';

import { useState, useEffect } from 'react';
import { Place } from '@/domain/entities/place';
import { getMultiplePlacesAction } from '@/actions/place.actions';
import { PlaceCard } from '@/presentation/features/places/components/place-card';
import { VIEWED_PLACES_KEY } from '@/presentation/components/shared/view-tracker';
import { getFromLocalStorage } from '@/presentation/components/marketplace/guest-tracker';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { HorizontalScroll } from '@/presentation/components/shared/ui/horizontal-scroll';

export function RecentlyViewedSection() {
    const [places, setPlaces] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecentlyViewed = async () => {
            try {
                const viewedIds = getFromLocalStorage(VIEWED_PLACES_KEY);
                if (!viewedIds || viewedIds.length === 0) {
                    setIsLoading(false);
                    return;
                }

                // Get top 4 or 8
                const idsToShow = viewedIds.slice(0, 4);
                const data = await getMultiplePlacesAction(idsToShow);
                setPlaces(data);
            } catch (error) {
                console.error('Error fetching recently viewed places:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecentlyViewed();
    }, []);

    if (!isLoading && places.length === 0) return null;

    return (
        <div className="mt-16">
            <HorizontalScroll
                title="شوهد مؤخراً"
                subtitle="الأماكن التي قمت بزيارتها مؤخراً"
                className="py-0 md:py-0" // Reset padding since HomeView parent has spacing
            >
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-4 w-full">
                            <Skeleton className="h-48 w-full rounded-2xl" />
                            <Skeleton className="h-4 w-3/4 rounded-full" />
                            <Skeleton className="h-4 w-1/2 rounded-full" />
                        </div>
                    ))
                ) : (
                    places.map((place) => (
                        <PlaceCard key={place.id} place={place} isCompact />
                    ))
                )}
            </HorizontalScroll>
        </div>
    );
}

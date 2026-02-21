'use client';

import React, { useState, useEffect } from 'react';
import { Place } from '@/domain/entities/place';
import { getPersonalizedRecommendations } from '@/actions/place.actions';
import { SpyEngine } from '@/lib/user-spy/spy-engine';
import { PlaceCard } from '@/presentation/features/places/components/place-card';
import { HorizontalScroll } from '@/presentation/components/shared/ui/horizontal-scroll';
import { Skeleton } from '@/presentation/components/ui/skeleton';

export function PersonalizedSection() {
    const [places, setPlaces] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [interestName, setInterestName] = useState<string | null>(null);

    useEffect(() => {
        const fetchPersonalized = async () => {
            const topInterest = SpyEngine.getTopInterest();
            if (!topInterest) {
                setIsLoading(false);
                return;
            }

            try {
                const data = await getPersonalizedRecommendations(topInterest);
                if (data.length > 0) {
                    setPlaces(data.slice(0, 8));
                    setInterestName(topInterest.replace('market_', ''));
                }
            } catch (error) {
                console.error('Failed to fetch personalized recommendations', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPersonalized();
    }, []);

    if (!isLoading && places.length === 0) return null;

    return (
        <HorizontalScroll
            title="مختار لك بعناية"
            subtitle={interestName ? `عشان اهتمامك بـ "${interestName}".. بص على دول` : "اقتراحات تهمك بناءً على تصفحك"}
            viewAllLink={interestName ? `/categories/${interestName}` : '/places'}
        >
            {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-4 w-64">
                        <Skeleton className="h-40 w-full rounded-2xl" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ))
            ) : (
                places.map((place) => (
                    <PlaceCard key={place.id} place={place} isCompact />
                ))
            )}
        </HorizontalScroll>
    );
}

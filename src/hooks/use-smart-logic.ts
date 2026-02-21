'use client';

import { useMemo, useEffect } from 'react';
import { SpyEngine, UserProfile } from '@/lib/user-spy/spy-engine';

/**
 * Hook for Smart Features
 * Provides recommendations, view history, and behavior-based analysis.
 */
export function useSmartLogic() {
    const profile = SpyEngine.getProfile();

    // 1. Get Recommendations (Simple Scoring System)
    const recommendations = useMemo(() => {
        // This would ideally involve filtering a list of places based on interest scores
        // For now, we return the top interest slug to help components filter themselves
        const topInterest = SpyEngine.getTopInterest();
        return {
            topCategory: topInterest,
            archetypes: profile.archetypes,
            isNewUser: profile.visitCount < 3
        };
    }, [profile]);

    // 2. Manage Recently Viewed (Synced from SpyEngine)
    const recentlyViewed = profile.viewedPlaces;

    // 3. Progressive Personalization Level
    const personalizationLevel = useMemo(() => {
        if (profile.visitCount > 10) return 'advanced';
        if (profile.visitCount > 3) return 'intermediate';
        return 'basic';
    }, [profile.visitCount]);

    return {
        profile,
        recommendations,
        recentlyViewed,
        personalizationLevel,
        trackInterest: (tag: string, weight?: number) => SpyEngine.trackInterest(tag, weight),
        trackView: (id: string, category?: string) => SpyEngine.trackPlaceView(id, category)
    };
}

'use client';

import { useEffect, useRef } from 'react';
import { SpyEngine } from './spy-engine';

/**
 * Tracks views of specific places.
 */
export function useSpyOnPlace(id: string, categorySlug?: string) {
    useEffect(() => {
        if (!id) return;
        SpyEngine.trackPlaceView(id, categorySlug);
    }, [id, categorySlug]);
}

/**
 * Tracks views of marketplace categories.
 */
export function useSpyOnMarketplace(categorySlug: string) {
    useEffect(() => {
        if (!categorySlug || categorySlug === 'all') return;
        SpyEngine.trackInterest(`market_${categorySlug}`, 3);
    }, [categorySlug]);
}

/**
 * Tracks reading progress of articles/news.
 */
export function useSpyOnArticle(id: string, title: string) {
    const hasReported = useRef(false);

    useEffect(() => {
        const handleScroll = () => {
            if (hasReported.current) return;

            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.scrollY;
            const progress = scrolled / scrollHeight;

            // Only track if meaningful progress is made (between 20% and 80%)
            // If they reach 90%, it's "finished" and handled by SpyEngine
            if (progress > 0.2) {
                SpyEngine.trackArticleProgress(id, title, progress);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [id, title]);
}

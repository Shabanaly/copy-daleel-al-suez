'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { SpyEngine } from '@/lib/user-spy/spy-engine';

/**
 * Hook for Resume Experience
 * Automatically saves and restores scroll and state for the user.
 */
export function usePersistence(category?: string) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. Save state on scroll/interaction
    const saveState = useCallback(() => {
        const filters: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            filters[key] = value;
        });

        SpyEngine.saveLastState({
            pathname,
            category,
            filters,
            scrollY: window.scrollY
        });
    }, [pathname, category, searchParams]);

    useEffect(() => {
        const handleScroll = () => {
            // Debounced state save (optional, but good for performance)
            const timer = setTimeout(saveState, 500);
            return () => clearTimeout(timer);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [saveState]);

    // 2. Restore state on mount if path matches
    useEffect(() => {
        const profile = SpyEngine.getProfile();
        if (profile.lastState && profile.lastState.pathname === pathname) {
            // Restore scroll
            if (profile.lastState.scrollY) {
                window.scrollTo({
                    top: profile.lastState.scrollY,
                    behavior: 'smooth'
                });
            }
        }
    }, [pathname]);

    return { saveState };
}

'use client';

/**
 * User Spy Engine
 * Tracks user behavior in localStorage to build a non-invasive "Interest Profile".
 * Privacy: All data stays in the browser.
 */

export const SPY_PROFILE_KEY = 'daleel_spy_profile';

export interface UserInterest {
    score: number;
    lastVisited: number;
}

export interface UnfinishedArticle {
    id: string;
    title: string;
    progress: number; // 0 to 1
    timestamp: number;
}

export interface UserProfile {
    interests: Record<string, UserInterest>; // key is category slug or section (e.g., 'market')
    viewedPlaces: string[];
    viewedMarketItems: string[];
    unfinishedArticles: Record<string, UnfinishedArticle>;
    lastActionTimestamp: number;
}

const INITIAL_PROFILE: UserProfile = {
    interests: {},
    viewedPlaces: [],
    viewedMarketItems: [],
    unfinishedArticles: {},
    lastActionTimestamp: Date.now(),
};

export const SpyEngine = {
    getProfile(): UserProfile {
        if (typeof window === 'undefined') return INITIAL_PROFILE;
        try {
            const stored = localStorage.getItem(SPY_PROFILE_KEY);
            return stored ? JSON.parse(stored) : INITIAL_PROFILE;
        } catch {
            return INITIAL_PROFILE;
        }
    },

    saveProfile(profile: UserProfile) {
        if (typeof window === 'undefined') return;
        try {
            profile.lastActionTimestamp = Date.now();
            localStorage.setItem(SPY_PROFILE_KEY, JSON.stringify(profile));
        } catch (e) {
            console.warn('SpyEngine: Failed to save profile', e);
        }
    },

    /**
     * Boost interest in a specific category or tag.
     */
    trackInterest(tag: string, weight: number = 1) {
        const profile = this.getProfile();
        if (!profile.interests[tag]) {
            profile.interests[tag] = { score: 0, lastVisited: Date.now() };
        }
        profile.interests[tag].score += weight;
        profile.interests[tag].lastVisited = Date.now();
        this.saveProfile(profile);
    },

    trackPlaceView(id: string, categorySlug?: string) {
        const profile = this.getProfile();
        // Add to viewed list (unique)
        if (!profile.viewedPlaces.includes(id)) {
            profile.viewedPlaces.unshift(id);
            if (profile.viewedPlaces.length > 20) profile.viewedPlaces.pop();
        }

        if (categorySlug) {
            this.trackInterest(categorySlug, 2);
        }
        this.saveProfile(profile);
    },

    trackArticleProgress(id: string, title: string, progress: number) {
        const profile = this.getProfile();
        if (progress > 0.1 && progress < 0.9) {
            profile.unfinishedArticles[id] = {
                id,
                title,
                progress,
                timestamp: Date.now(),
            };
        } else if (progress >= 0.9) {
            // Consider it finished
            delete profile.unfinishedArticles[id];
        }
        this.saveProfile(profile);
    },

    getTopInterest(): string | null {
        const profile = this.getProfile();
        const sorted = Object.entries(profile.interests)
            .sort((a, b) => b[1].score - a[1].score);
        return sorted.length > 0 ? sorted[0][0] : null;
    }
};

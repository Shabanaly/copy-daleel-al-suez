'use client';

/**
 * User Spy Engine (Advanced)
 * Tracks user behavior in localStorage to build a non-invasive "Intelligence Profile".
 * Implemented with time-decay scoring and behavioral archetypes.
 */

export const SPY_PROFILE_KEY = 'daleel_spy_profile';

export interface UserInterest {
    score: number;
    lastVisited: number;
    hits: number;
}

export interface UnfinishedArticle {
    id: string;
    title: string;
    progress: number; // 0 to 1
    timestamp: number;
}

export interface LastState {
    pathname: string;
    category?: string;
    filters?: Record<string, any>;
    scrollY?: number;
    timestamp: number;
}

export interface UserProfile {
    interests: Record<string, UserInterest>; // key is category slug or section
    viewedPlaces: string[];
    viewedMarketItems: string[];
    unfinishedArticles: Record<string, UnfinishedArticle>;
    lastActionTimestamp: number;
    visitCount: number;
    lastState?: LastState;
    archetypes: string[]; // e.g., 'foodie', 'auto-enthusiast'
}

const INITIAL_PROFILE: UserProfile = {
    interests: {},
    viewedPlaces: [],
    viewedMarketItems: [],
    unfinishedArticles: {},
    lastActionTimestamp: Date.now(),
    visitCount: 0,
    archetypes: [],
};

const DECAY_RATE_PER_DAY = 0.05; // 5% daily decay

export const SpyEngine = {
    getProfile(): UserProfile {
        if (typeof window === 'undefined') return INITIAL_PROFILE;
        try {
            const stored = localStorage.getItem(SPY_PROFILE_KEY);
            let profile: UserProfile = stored
                ? { ...INITIAL_PROFILE, ...JSON.parse(stored) }
                : { ...INITIAL_PROFILE };

            // Apply simple time decay on retrieval
            return this.applyDecay(profile);
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

    applyDecay(profile: UserProfile): UserProfile {
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        Object.keys(profile.interests).forEach(key => {
            const interest = profile.interests[key];
            const daysPassed = (now - interest.lastVisited) / oneDayMs;
            if (daysPassed >= 1) {
                // Decay formula: score * (1 - decay_rate)^days
                interest.score = interest.score * Math.pow(1 - DECAY_RATE_PER_DAY, Math.floor(daysPassed));
                // Optional: remove very low interests
                if (interest.score < 0.1) delete profile.interests[key];
            }
        });

        return profile;
    },

    /**
     * Boost interest in a specific category or tag.
     */
    trackInterest(tag: string, weight: number = 1) {
        const profile = this.getProfile();
        if (!profile.interests[tag]) {
            profile.interests[tag] = { score: 0, lastVisited: Date.now(), hits: 0 };
        }

        const item = profile.interests[tag];
        item.score += weight;
        item.hits += 1;
        item.lastVisited = Date.now();

        this.updateArchetypes(profile);
        this.saveProfile(profile);
    },

    updateArchetypes(profile: UserProfile) {
        const potentialArchetypes = [];

        // Logic for "Foodie"
        const foodInterests = ['restaurants', 'cafes', 'food', 'market_food'];
        const foodScore = foodInterests.reduce((acc, cat) => acc + (profile.interests[cat]?.score || 0), 0);
        if (foodScore > 10) potentialArchetypes.push('foodie');

        // Logic for "Auto Enthusiast"
        const autoInterests = ['cars', 'mechanics', 'market_vehicles'];
        const autoScore = autoInterests.reduce((acc, cat) => acc + (profile.interests[cat]?.score || 0), 0);
        if (autoScore > 10) potentialArchetypes.push('auto-enthusiast');

        profile.archetypes = [...new Set(potentialArchetypes)];
    },

    trackPlaceView(id: string, categorySlug?: string) {
        const profile = this.getProfile();
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
            delete profile.unfinishedArticles[id];
        }
        this.saveProfile(profile);
    },

    saveLastState(state: Omit<LastState, 'timestamp'>) {
        const profile = this.getProfile();
        profile.lastState = { ...state, timestamp: Date.now() };
        this.saveProfile(profile);
    },

    incrementVisitCount() {
        const profile = this.getProfile();
        profile.visitCount += 1;
        this.saveProfile(profile);
    },

    getTopInterest(): string | null {
        const profile = this.getProfile();
        const sorted = Object.entries(profile.interests)
            .sort((a, b) => b[1].score - a[1].score);
        return sorted.length > 0 ? sorted[0][0] : null;
    }
};

'use server'

import { createReadOnlyClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

interface HeroSuggestion {
    id: string
    name: string
    slug: string
    icon?: string
    placesCount?: number
    previewPlaces?: { id: string, name: string }[]
}

async function fetchHeroSuggestionsFromDB(): Promise<HeroSuggestion[]> {
    const supabase = await createReadOnlyClient()

    try {
        // Fetch top 8 active categories using the smart popularity RPC
        const { data: topCategories, error: catsError } = await supabase
            .rpc('get_smart_categories', { limit_count: 8 })

        if (catsError) {
            console.error('Database error fetching top categories:', catsError.message || catsError);
            return [];
        }

        let suggestions: HeroSuggestion[] = (topCategories as any[] || []).map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon
        }));

        // Fill gaps with random categories if less than 8
        if (suggestions.length < 8) {
            const needed = 8 - suggestions.length;
            const existingIds = suggestions.map(s => s.id);
            let query = supabase
                .from('categories')
                .select('id, name, slug, icon')
                .eq('is_active', true)
                .limit(20);

            if (existingIds.length > 0) {
                query = query.not('id', 'in', `(${existingIds.join(',')})`);
            }

            const { data: randomCategories, error: randomError } = await query;

            if (randomError) {
                console.error('Database error fetching random categories:', randomError.message || randomError);
            } else if (randomCategories && randomCategories.length > 0) {
                const randomPicks = randomCategories.sort(() => Math.random() - 0.5).slice(0, needed);
                suggestions = [
                    ...suggestions,
                    ...randomPicks.map(c => ({
                        id: c.id,
                        name: c.name,
                        slug: c.slug,
                        icon: c.icon
                    }))
                ];
            }
        }

        // Fetch Previews & Place Counts in parallel
        const enrichedSuggestions = await Promise.all(suggestions.map(async (cat) => {
            // Count active places
            const { count } = await supabase
                .from('places')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', cat.id)
                .eq('status', 'active');

            // Fetch top 3 places for preview
            const { data: catPlaces } = await supabase
                .from('places')
                .select('id, name')
                .eq('category_id', cat.id)
                .eq('status', 'active')
                .order('rating', { ascending: false })
                .limit(3);

            return {
                ...cat,
                placesCount: count || 0,
                previewPlaces: catPlaces || []
            };
        }));

        return enrichedSuggestions;
    } catch (e: any) {
        console.error('Exception fetching dynamic hero suggestions:', e?.message || e)
        return []
    }
}

export const getDynamicHeroSuggestions = unstable_cache(
    fetchHeroSuggestionsFromDB,
    ['dynamic-hero-suggestions'],
    {
        revalidate: 3600, // Cache for 1 hour
        tags: ['categories']
    }
);

'use server'

import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/utils/sanitize'

export interface MarketplaceSearchResult {
    id: string
    title: string
    description: string
    image?: string
    slug: string
    price: number
    condition: string
    category: string
    created_at: string
}

const LISTING_FIELDS = `
    id, 
    title, 
    price, 
    images, 
    is_featured, 
    slug, 
    category, 
    location, 
    created_at, 
    condition,
    status,
    expires_at
`

export async function searchMarketplace(query: string, areaId?: string): Promise<MarketplaceSearchResult[]> {
    if (!query || query.length < 2) return []

    const cleanQuery = sanitizeText(query).substring(0, 100) // حد أقصى 100 حرف
    if (!cleanQuery || cleanQuery.length < 2) return []

    const supabase = await createClient()
    const q = `%${cleanQuery}%`

    let dbQuery = supabase
        .from('marketplace_items')
        .select(`
            id,
            title,
            description,
            slug,
            images,
            price,
            condition,
            category,
            created_at
        `)
        .eq('status', 'active')
        .or(`title.ilike.${q},description.ilike.${q}`) // بحث في العنوان والوصف
        .limit(10)
        .order('created_at', { ascending: false })

    // Add area filter if provided
    if (areaId) {
        dbQuery = dbQuery.eq('area_id', areaId)
    }

    const { data: items, error } = await dbQuery

    if (error) {
        console.error('Marketplace search error:', error)
        return []
    }

    return items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description?.substring(0, 60) + '...',
        // @ts-ignore
        image: item.images && item.images.length > 0 ? item.images[0] : undefined,
        slug: item.slug || item.id,
        price: item.price,
        condition: item.condition,
        category: item.category,
        created_at: item.created_at
    }))
}

import { MarketplaceItem } from '@/domain/entities/marketplace-item'

export async function getRecommendedItems(localHistory: string[] = []): Promise<MarketplaceItem[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    try {
        let specializedItems: MarketplaceItem[] = []
        let excludeIds: string[] = []

        if (user) {
            // 1. Fetch User Events (Last 30 Days)
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const { data: events } = await supabase
                .from('user_events')
                .select('event_type, category_id, metadata, entity_id')
                .eq('user_id', user.id)
                .gte('created_at', thirtyDaysAgo.toISOString())
                .limit(100)

            if (events && events.length > 0) {
                // 2. Calculate Category Scores & Extract Search Terms
                const categoryScores: Record<string, number> = {}
                const searchTerms: string[] = []

                events.forEach(e => {
                    // Score Categories
                    if (e.category_id) {
                        let score = 1
                        if (e.event_type === 'contact_seller' || e.event_type === 'favorite') score = 5
                        else if (e.event_type === 'view_item') score = 2

                        categoryScores[e.category_id] = (categoryScores[e.category_id] || 0) + score
                    }

                    // Extract Search Terms
                    if (e.event_type === 'search' && e.metadata?.query) {
                        searchTerms.push(e.metadata.query)
                    }
                })

                // Get Top 3 Categories
                const topCategories = Object.entries(categoryScores)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([cat]) => cat)

                // Get Top 3 Recent Searches
                const topSearches = [...new Set(searchTerms)].slice(0, 3) // Unique recent

                // 3. Build Query
                if (topCategories.length > 0 || topSearches.length > 0) {
                    let dbQuery = supabase
                        .from('marketplace_items')
                        .select(LISTING_FIELDS)
                        .eq('status', 'active')
                        .neq('seller_id', user.id)

                    let conditions: string[] = []

                    if (topCategories.length > 0) {
                        conditions.push(`category.in.(${topCategories.map(c => `"${c}"`).join(',')})`)
                    }

                    topSearches.forEach(term => {
                        const clean = sanitizeText(term)
                        if (clean.length > 2) {
                            conditions.push(`title.ilike.%${clean}%,description.ilike.%${clean}%`)
                        }
                    })

                    if (conditions.length > 0) {
                        dbQuery = dbQuery.or(conditions.join(','))
                        const { data } = await dbQuery.limit(15).order('created_at', { ascending: false })

                        if (data) {
                            specializedItems = data as MarketplaceItem[]
                            excludeIds = specializedItems.map(i => i.id)
                        }
                    }
                }
            }
        }

        // --- Fallback / Fill ---
        // If we have < 10 items, fill with "Trending" (Most Viewed) or "Latest"
        const TARGET_COUNT = 10
        if (specializedItems.length < TARGET_COUNT) {
            const needed = TARGET_COUNT - specializedItems.length

            let fallbackQuery = supabase
                .from('marketplace_items')
                .select(LISTING_FIELDS)
                .eq('status', 'active')
                .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

            if (user) fallbackQuery = fallbackQuery.neq('seller_id', user.id)
            if (excludeIds.length > 0) fallbackQuery = fallbackQuery.not('id', 'in', `(${excludeIds.join(',')})`)

            const { data: fallbackItems } = await fallbackQuery
                .order('created_at', { ascending: false })
                .limit(needed)

            if (fallbackItems) {
                specializedItems = [...specializedItems, ...(fallbackItems as MarketplaceItem[])]
            }
        }

        // Shuffle
        const uniqueItems = Array.from(new Map(specializedItems.map(item => [item.id, item])).values())
        return uniqueItems.sort(() => Math.random() - 0.5)

    } catch (error) {
        console.error('Smart Recommendation Engine Failed:', error)
        return [] // Graceful degradation handled by UI
    }
}

// Showcase Section Logic
import { MARKETPLACE_FORMS } from '@/config/marketplace-forms'

export interface ShowcaseSection {
    title: string
    icon: string
    category: string
    subType?: string
    items: MarketplaceItem[]
}

export async function getShowcaseSections(): Promise<ShowcaseSection[]> {
    const supabase = await createClient()
    const allCategories = Object.values(MARKETPLACE_FORMS)

    // Shuffle categories to get random order
    const shuffledCategories = allCategories.sort(() => 0.5 - Math.random())

    const sections: ShowcaseSection[] = []
    const TARGET_SECTIONS = 5

    // Loop through categories until we fill 5 sections or run out
    for (const cat of shuffledCategories) {
        if (sections.length >= TARGET_SECTIONS) break

        try {
            // 1. First, fetch a batch of recent active items for this category to inspect their data
            // We use this to see what Sub-Types are actually populated
            const { data: recentItems } = await supabase
                .from('marketplace_items')
                .select('id, attributes')
                .eq('status', 'active')
                .eq('category', cat.id)
                .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
                .order('created_at', { ascending: false })
                .limit(20)

            if (!recentItems || recentItems.length === 0) {
                continue // Category is empty, skip
            }

            // 2. Determine if we can show a specific Sub-Type
            let selectedSubType: string | undefined
            let queryTitle = cat.label

            const typeKey = cat.typeSelector.name

            // Extract all available sub-types from the fetched items
            const availableSubTypes = recentItems
                .map(item => item.attributes?.[typeKey])
                .filter(Boolean) // Filter out undefined/null

            // Remove duplicates
            const distinctSubTypes = [...new Set(availableSubTypes)]

            if (distinctSubTypes.length > 0) {
                // Pick a random populated sub-type
                selectedSubType = distinctSubTypes[Math.floor(Math.random() * distinctSubTypes.length)] as string
                queryTitle = selectedSubType
            }

            // 3. Fetch the final list of items for the section
            let dbQuery = supabase
                .from('marketplace_items')
                .select(LISTING_FIELDS)
                .eq('status', 'active')
                .eq('category', cat.id)
                .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
                .order('created_at', { ascending: false })
                .limit(7)

            if (selectedSubType) {
                dbQuery = dbQuery.contains('attributes', { [typeKey]: selectedSubType })
            }

            const { data: finalItems } = await dbQuery

            if (finalItems && finalItems.length > 0) {
                sections.push({
                    title: queryTitle,
                    icon: cat.icon,
                    category: cat.id,
                    subType: selectedSubType,
                    items: finalItems as MarketplaceItem[]
                })
            }

        } catch (error) {
            // Ignore individual category errors to not break the whole page
            console.error(`Error processing section for category ${cat.id}:`, error)
        }
    }

    return sections
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { MarketplaceItem } from '@/domain/entities/marketplace-item'
import { MARKETPLACE_FORMS } from '@/config/marketplace-forms'
import { SupabaseAreaRepository } from '@/data/repositories/supabase-area.repository'

// Fields required for the MarketplaceItemCard and common listing views
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

// Helper to map DB row to Entity
function mapToEntity(row: any): MarketplaceItem {
    return {
        ...row,
        id: row.id,
        slug: row.slug || row.id,
        viewCount: row.view_count || 0,
        images: row.images || [],
        price: row.price || 0,
    } as MarketplaceItem
}

// 1. Discover Section (Trending + Featured shuffle)
export async function getDiscoverItems(): Promise<MarketplaceItem[]> {
    const supabase = await createClient()

    // Mix of featured and high-view items
    const { data: items } = await supabase
        .from('marketplace_items')
        .select(LISTING_FIELDS)
        .eq('status', 'active')
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('is_featured', { ascending: false }) // Featured first
        .limit(20)

    if (!items) return []

    // Random shuffle for "Discovery" feel
    const mappedItems = items.map(mapToEntity)
    const shuffled = mappedItems.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 8)
}

// 2. Continue Browsing (Recently User Viewed)
export async function getRecentlyViewedItems(): Promise<MarketplaceItem[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Get last 10 viewed item IDs from user_events
    const { data: events } = await supabase
        .from('user_events')
        .select('entity_id')
        .eq('user_id', user.id)
        .eq('event_type', 'view_item')
        .not('entity_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20)

    if (!events || events.length === 0) return []

    // Distinct IDs
    const distinctIds = [...new Set(events.map(e => e.entity_id))].slice(0, 8)

    if (distinctIds.length === 0) return []

    // Fetch details
    const { data: items } = await supabase
        .from('marketplace_items')
        .select(LISTING_FIELDS)
        .in('id', distinctIds)
        .eq('status', 'active')

    if (!items) return []

    // Sort by viewing order (restore order)
    const itemMap = new Map(items.map(i => [i.id, mapToEntity(i)]))
    const sortedItems = distinctIds
        .map(id => itemMap.get(id))
        .filter(Boolean) as MarketplaceItem[]

    return sortedItems
}

// 3. Popular Nearby (Currently widespread if no area provided)
export async function getPopularNearbyItems(areaId?: string): Promise<MarketplaceItem[]> {
    const supabase = await createClient()

    let query = supabase
        .from('marketplace_items')
        .select(LISTING_FIELDS)
        .eq('status', 'active')
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        // Approximating "Popular" by view count if available
        .order('created_at', { ascending: false })
        .limit(10)

    if (areaId) {
        query = query.eq('area_id', areaId)
    }

    const { data: items } = await query
    return (items || []).map(mapToEntity)
}

// 3.5 Optimized Nearby (Proximity Fallback)
export async function getNearbyItemsOptimized(areaId?: string): Promise<MarketplaceItem[]> {
    const supabase = await createClient()
    const limit = 8

    if (!areaId) {
        return getPopularNearbyItems()
    }

    try {
        // 1. Fetch items from the exact area first
        const { data: exactMatchItems, error: exactError } = await supabase
            .from('marketplace_items')
            .select(LISTING_FIELDS)
            .eq('status', 'active')
            .eq('area_id', areaId)
            .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (exactError) throw exactError

        const results = (exactMatchItems || []).map(mapToEntity)

        // 2. If we have enough, return them
        if (results.length >= limit) {
            return results
        }

        // 3. Otherwise, find items in the same district
        const areaRepo = new SupabaseAreaRepository(supabase)
        const allAreas = await areaRepo.getAreas()
        const targetArea = allAreas.find(a => a.id === areaId)

        if (!targetArea || !targetArea.districtId) return results

        // Find other areas in the same district
        const siblingAreaIds = allAreas
            .filter(a => a.districtId === targetArea.districtId && a.id !== areaId)
            .map(a => a.id)

        if (siblingAreaIds.length === 0) return results

        const { data: neighborItems, error: neighborError } = await supabase
            .from('marketplace_items')
            .select(LISTING_FIELDS)
            .eq('status', 'active')
            .in('area_id', siblingAreaIds)
            .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
            .order('created_at', { ascending: false })
            .limit(limit - results.length)

        if (neighborError) {
            console.error('Proximity fetch error:', neighborError)
            return results
        }

        // Combine and return
        const finalResults = [...results, ...(neighborItems || []).map(mapToEntity)]
        return finalResults

    } catch (error) {
        console.error('getNearbyItemsOptimized failed:', error)
        return getPopularNearbyItems(areaId) // Fallback to basic
    }
}

// 4. Fresh & New
export async function getFreshItems(): Promise<MarketplaceItem[]> {
    const supabase = await createClient()

    const { data: items } = await supabase
        .from('marketplace_items')
        .select(LISTING_FIELDS)
        .eq('status', 'active')
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false })
        .limit(8)

    return (items || []).map(mapToEntity)
}

// 5. Guest Recommendations (Based on client-provided IDs)
export async function getGuestRecommendations(
    viewedItemIds: string[],
    viewedCategories: string[]
): Promise<MarketplaceItem[]> {
    const supabase = await createClient()

    if (viewedItemIds.length === 0 && viewedCategories.length === 0) return []

    let query = supabase
        .from('marketplace_items')
        .select(LISTING_FIELDS)
        .eq('status', 'active')
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    const conditions: string[] = []

    if (viewedCategories.length > 0) {
        conditions.push(`category.in.(${viewedCategories.map(c => `"${c}"`).join(',')})`)
    }

    if (conditions.length > 0) {
        query = query.or(conditions.join(','))
    }

    // Exclude already viewed items to show new stuff
    if (viewedItemIds.length > 0) {
        query = query.not('id', 'in', `(${viewedItemIds.join(',')})`)
    }

    const { data: items } = await query.limit(10)

    if (!items) return []
    const mappedItems = items.map(mapToEntity)
    return mappedItems.sort(() => Math.random() - 0.5)
}

// 6. Good As New (Condition: new or like_new)
export async function getGoodAsNewItems(): Promise<MarketplaceItem[]> {
    const supabase = await createClient()

    // Fetch items with 'new' or 'like_new' condition
    // We can't easily do "random" efficiently without RPC, so we'll fetch latest.
    // Or we can fetch a slightly larger batch and shuffle in-memory if needed, 
    // but for now, "latest good condition" is a solid value proposition.
    const { data: items, error } = await supabase
        .from('marketplace_items')
        .select(LISTING_FIELDS)
        .eq('status', 'active')
        .in('condition', ['new', 'like_new'])
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false })
        .limit(10)

    if (error) console.error('Good As New Error:', error)

    return (items || []).map(mapToEntity)
}

// 7. Hourly Spotlight (Random Category)
export async function getHourlySpotlight(): Promise<{ title: string, items: MarketplaceItem[], link: string, icon: string } | null> {
    const supabase = await createClient()
    const categories = Object.values(MARKETPLACE_FORMS)

    // Try up to 5 times to find a category with items
    for (let i = 0; i < 5; i++) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)]

        const { data: items, error } = await supabase
            .from('marketplace_items')
            .select(LISTING_FIELDS)
            .eq('status', 'active')
            .eq('category', randomCategory.id)
            .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
            .limit(8)

        if (error) console.error('Spotlight Error:', error)

        if (items && items.length > 0) {
            return {
                title: randomCategory.label,
                items: items.map(mapToEntity),
                link: `/marketplace/browse?category=${randomCategory.id}`,
                icon: randomCategory.icon
            }
        }
    }

    return null
}

// 8. Items by Category (for Client-side Smart Section)
export async function getItemsByCategory(categoryId: string): Promise<MarketplaceItem[]> {
    const supabase = await createClient()

    const { data: items, error } = await supabase
        .from('marketplace_items')
        .select(LISTING_FIELDS)
        .eq('status', 'active')
        .eq('category', categoryId)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false })
        .limit(8)

    if (error) console.error('Smart Category Error:', error)

    return (items || []).map(mapToEntity)
}

// 9. Related Type Items (See Also - Personalized)
export async function getRelatedTypeItems(categoryId: string, typeKey: string, typeValue: any): Promise<MarketplaceItem[]> {
    const supabase = await createClient()

    // Construct JSONB filter
    // attributes->>typeKey = typeValue
    const { data: items, error } = await supabase
        .from('marketplace_items')
        .select(LISTING_FIELDS)
        .eq('status', 'active')
        .eq('category', categoryId)
        // items with this specific attribute value
        .contains('attributes', { [typeKey]: typeValue })
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false })
        .limit(8)

    if (error) console.error('Related Type Error:', error)

    return (items || []).map(mapToEntity)
}

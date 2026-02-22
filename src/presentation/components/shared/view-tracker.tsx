'use client'

import { useEffect } from 'react'
import { useViewIncrement } from '@/presentation/hooks/use-view-increment'
import { trackUserEvent } from '@/actions/analytics.actions'
import { addToLocalStorage } from '@/presentation/components/marketplace/guest-tracker'

export const VIEWED_PLACES_KEY = 'daleel_viewed_places'
export const VIEWED_EVENTS_KEY = 'daleel_viewed_events'
export const VIEWED_ARTICLES_KEY = 'daleel_viewed_articles'
export const VIEWED_MARKET_KEY = 'daleel_viewed_items'
export const VIEWED_COMMUNITY_KEY = 'daleel_viewed_questions'

type TableName = 'categories' | 'places' | 'events' | 'marketplace_items' | 'articles' | 'community_questions'

interface ViewTrackerProps {
    tableName: TableName
    id: string
    categoryId?: string
}

export function ViewTracker({ tableName, id, categoryId }: ViewTrackerProps) {
    useViewIncrement(tableName, id)

    useEffect(() => {
        // Track personalized view event (Server - if logged in)
        const isMarketplaceItem = tableName === 'marketplace_items'

        trackUserEvent({
            eventType: 'view_item',
            entityId: isMarketplaceItem ? id : undefined, // ONLY for marketplace_items to avoid FK error
            categoryId: categoryId,
            metadata: {
                entityType: isMarketplaceItem ? 'marketplace_item' : tableName.slice(0, -1),
                originalEntityId: !isMarketplaceItem ? id : undefined // Store ID in metadata for non-marketplace items
            }
        })

        // Track for Guest (Client - LocalStorage)
        if (tableName === 'marketplace_items') {
            addToLocalStorage(VIEWED_MARKET_KEY, id)
        } else if (tableName === 'places') {
            addToLocalStorage(VIEWED_PLACES_KEY, id)
        } else if (tableName === 'events') {
            addToLocalStorage(VIEWED_EVENTS_KEY, id)
        } else if (tableName === 'articles') {
            addToLocalStorage(VIEWED_ARTICLES_KEY, id)
        } else if (tableName === 'community_questions') {
            addToLocalStorage(VIEWED_COMMUNITY_KEY, id)
        }
    }, [tableName, id, categoryId])

    return null
}

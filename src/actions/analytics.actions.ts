'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type EventType = 'view_item' | 'view_category' | 'search' | 'contact_seller' | 'favorite';

interface WebEvent {
    eventType: EventType
    entityId?: string // Item ID
    categoryId?: string // Category ID
    metadata?: Record<string, any> // Additional details
}

export async function trackUserEvent(event: WebEvent) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // We can optionally track guest events in a cookie or anon session later,
        // but for now we focus on authenticated users for personalization.
        return { success: false, message: 'User not authenticated' }
    }

    try {
        const { error } = await supabase
            .from('user_events')
            .insert({
                user_id: user.id,
                event_type: event.eventType,
                entity_id: event.entityId,
                category_id: event.categoryId,
                metadata: event.metadata || {}
            })

        if (error) throw error

        return { success: true }
    } catch (error) {
        console.error('Failed to track user event:', error)
        // Fail silently to not disrupt user experience
        return { success: false }
    }
}

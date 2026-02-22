'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function incrementViewAction(tableName: string, id: string) {
    const supabase = await createClient()
    const headerList = await headers()

    // Get client context for smart tracking
    const ip = headerList.get('x-forwarded-for') || '0.0.0.0'
    const userAgent = headerList.get('user-agent') || ''

    // Check if it's a known bot/crawler to avoid inflating counts
    const isBot = /bot|spider|crawler|lighthouse|inspect/i.test(userAgent)
    if (isBot) return { success: true, skipped: 'bot' }

    try {
        const { data: { user } } = await supabase.auth.getUser()

        // Map table names to entity types for the RPC
        const entityTypeMap: Record<string, string> = {
            'places': 'place',
            'marketplace_items': 'marketplace_item',
            'categories': 'category',
            'events': 'event',
            'articles': 'article',
            'community_questions': 'community_question'
        };

        const entityType = entityTypeMap[tableName] || tableName.replace(/s$/, '');

        // Use the generalized log_smart_view RPC for all entity types
        const { error } = await supabase.rpc('log_smart_view', {
            p_entity_id: id,
            p_entity_type: entityType,
            p_user_id: user?.id || null,
            p_session_id: null,
            p_ip_address: ip
        })

        if (error) throw error

        return { success: true }
    } catch (err: any) {
        console.error(`Error incrementing view for ${tableName} ${id}:`, err)
        return { success: false, error: err.message || 'Error' }
    }
}
export async function incrementViewsBatchAction(events: { tableName: string, id: string }[]) {
    const supabase = await createClient()
    const headerList = await headers()
    const userAgent = headerList.get('user-agent') || ''
    const isBot = /bot|spider|crawler|lighthouse|inspect/i.test(userAgent)
    if (isBot || events.length === 0) return { success: true, skipped: 'bot_or_empty' }

    try {
        // For now, we process them in parallel for simplicity, but we could use a single RPC
        const results = await Promise.allSettled(events.map(event =>
            incrementViewAction(event.tableName, event.id)
        ))

        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
            console.error(`Batch partially failed: ${failed.length} errors`);
        }

        return { success: true, count: events.length }
    } catch (err: any) {
        console.error(`Error in batch increment:`, err)
        return { success: false, error: err.message || 'Error' }
    }
}

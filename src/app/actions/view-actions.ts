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

        if (tableName === 'marketplace_items') {
            // Use the Smart View logic for marketplace
            const { error } = await supabase.rpc('log_smart_view', {
                p_item_id: id,
                p_user_id: user?.id || null,
                p_session_id: null, // We could use a cookie here if needed, but IP + ID is a good start
                p_ip_address: ip
            })

            if (error) throw error
        } else if (tableName === 'categories') {
            // Use the specific category increment RPC
            const { error } = await supabase.rpc('increment_category_view', {
                row_id: id
            })
            if (error) throw error
        } else {
            // Fallback for other tables
            const { error } = await supabase.rpc('increment_view_count', {
                table_name: tableName,
                row_id: id
            })
            if (error) throw error
        }

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

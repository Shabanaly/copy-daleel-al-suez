'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SearchHistoryItem {
    id: string
    query: string
    scope: string
    filters: any
    created_at: string
}

export async function saveSearchQuery(query: string, scope: string = 'global', filters: any = {}) {
    console.log(`>>> [SERVER] saveSearchQuery START: q="${query}", scope=${scope}`)

    if (!query || query.trim().length < 2) {
        console.log('>>> [SERVER] Query too short, aborting.')
        return
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) return

    try {
        const { error: insertError } = await supabase.from('user_events').insert({
            user_id: user.id,
            event_type: 'search',
            metadata: {
                query: query.trim(),
                scope,
                filters
            }
        })

        if (insertError) {
            console.error('Failed to save search history to user_events:', insertError.message)
            throw insertError
        }

    } catch (error) {
        console.error('Search history persistence failed', error)
    }
}

export async function getSearchHistory(scope?: string, limit: number = 5): Promise<SearchHistoryItem[]> {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) return []

    let queryBuilder = supabase
        .from('user_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_type', 'search')
        .order('created_at', { ascending: false })
        .limit(limit * 4) // Fetch more to allow for filtering/dedup if needed

    const { data, error } = await queryBuilder

    if (error) {
        console.error('Failed to fetch search history from user_events:', error.message)
        return []
    }

    if (!data || data.length === 0) return []

    // Map user_events to SearchHistoryItem
    const historyItems: SearchHistoryItem[] = data.map(item => ({
        id: item.id,
        query: item.metadata?.query || '',
        scope: item.metadata?.scope || 'global',
        filters: item.metadata?.filters || {},
        created_at: item.created_at
    })).filter(item => {
        if (!scope) return true;
        return item.scope === scope;
    });

    // Client-side deduplication (keep latest unique queries)
    const uniqueQueries = new Set()
    const uniqueHistory: SearchHistoryItem[] = []

    for (const item of historyItems) {
        const normalizedQuery = item.query.toLowerCase().trim()
        if (normalizedQuery && !uniqueQueries.has(normalizedQuery)) {
            uniqueQueries.add(normalizedQuery)
            uniqueHistory.push(item)
        }
        if (uniqueHistory.length >= limit) break
    }

    return uniqueHistory
}

export async function deleteSearchItem(id: string, queryText?: string) {
    console.log(`>>> [SERVER] deleteSearchItem: id=${id}, queryText="${queryText}"`)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        console.error('>>> [SERVER] deleteSearchItem: Auth error or no user', authError)
        return
    }

    try {
        if (queryText) {
            const trimmedQuery = queryText.trim()

            // Find all matching IDs first (robust strategy)
            const { data: toDelete, error: findError } = await supabase
                .from('user_events')
                .select('id')
                .eq('user_id', user.id)
                .eq('event_type', 'search')
                .filter('metadata->>query', 'eq', trimmedQuery)

            if (findError) {
                await supabase.from('user_events').delete().eq('id', id).eq('user_id', user.id)
                return
            }

            if (toDelete && toDelete.length > 0) {
                const idsToDelete = toDelete.map(item => item.id)
                await supabase
                    .from('user_events')
                    .delete()
                    .in('id', idsToDelete)
                    .eq('user_id', user.id)
            } else {
                // Fallback
                await supabase.from('user_events').delete().eq('id', id).eq('user_id', user.id)
            }
        } else {
            await supabase.from('user_events').delete().eq('id', id).eq('user_id', user.id)
        }
    } catch (err) {
        await supabase.from('user_events').delete().eq('id', id).eq('user_id', user.id)
    }

    revalidatePath('/marketplace')
    revalidatePath('/search')
}

export async function clearSearchHistory() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from('user_events').delete().eq('user_id', user.id).eq('event_type', 'search')
    revalidatePath('/marketplace')
}

'use server'

import { requireAdmin } from '@/lib/supabase/auth-utils'

export async function adminGlobalSearchAction(query: string) {
    try {
        const { supabase } = await requireAdmin()

        if (!query || query.length < 2) return { success: true, results: { users: [], items: [], places: [] } }

        const isSuperAdmin = (await supabase.from('profiles').select('role').eq('id', (await supabase.auth.getUser()).data.user?.id).single()).data?.role === 'super_admin'

        // Start searches in parallel - handle separately to avoid complex type issues in arrays
        const itemsPromise = supabase.from('marketplace_items').select('id, title, slug').ilike('title', `%${query}%`).limit(5)
        const placesPromise = supabase.from('places').select('id, name, slug').ilike('name', `%${query}%`).limit(5)
        const usersPromise = isSuperAdmin
            ? supabase.from('profiles').select('id, full_name, role').or(`full_name.ilike.%${query}%,email.ilike.%${query}%`).limit(5)
            : Promise.resolve({ data: [] })

        const [itemsRes, placesRes, usersRes] = await Promise.all([
            itemsPromise,
            placesPromise,
            usersPromise
        ])

        return {
            success: true,
            results: {
                users: (usersRes as any).data || [],
                items: itemsRes.data || [],
                places: placesRes.data || []
            }
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

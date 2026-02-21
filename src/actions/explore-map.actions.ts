'use server'

import { createClient } from '@/lib/supabase/server'

export async function getExploreLocationsAction() {
    // Coordinate-based map is disabled as part of the District transition
    return { success: true, locations: [] }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth-utils'

export interface OverviewStats {
    marketplace: {
        pending: number
        today: number
        reports: number
    }
    community: {
        flaggedQuestions: number
        flaggedAnswers: number
    }
    places: {
        total: number
        pending: number
        featured: number
    }
    claims: {
        pending: number
    }
    users: {
        total: number
    }
}

export async function getAdminOverviewStatsAction(): Promise<{ success: boolean; stats?: OverviewStats; error?: string }> {
    try {
        const { supabase } = await requireAdmin()

        const [
            mpPending,
            mpToday,
            mpReports,
            flaggedQ,
            flaggedA,
            placesTotal,
            placesPending,
            placesFeatured,
            pendingClaims,
            totalUsers
        ] = await Promise.all([
            // Marketplace
            supabase.from('marketplace_items').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('marketplace_items').select('id', { count: 'exact', head: true })
                .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
            supabase.from('reports').select('id', { count: 'exact', head: true }).eq('target_type', 'item').eq('status', 'pending'),

            // Community
            supabase.from('reports').select('id', { count: 'exact', head: true }).eq('target_type', 'question').eq('status', 'pending'),
            supabase.from('reports').select('id', { count: 'exact', head: true }).eq('target_type', 'answer').eq('status', 'pending'),

            // Places
            supabase.from('places').select('id', { count: 'exact', head: true }),
            supabase.from('places').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('places').select('id', { count: 'exact', head: true }).eq('is_featured', true),

            // Claims
            supabase.from('business_claims').select('id', { count: 'exact', head: true }).eq('status', 'pending'),

            // Users
            supabase.from('profiles').select('id', { count: 'exact', head: true })
        ])

        return {
            success: true,
            stats: {
                marketplace: {
                    pending: mpPending.count || 0,
                    today: mpToday.count || 0,
                    reports: mpReports.count || 0,
                },
                community: {
                    flaggedQuestions: flaggedQ.count || 0,
                    flaggedAnswers: flaggedA.count || 0,
                },
                places: {
                    total: placesTotal.count || 0,
                    pending: placesPending.count || 0,
                    featured: placesFeatured.count || 0,
                },
                claims: {
                    pending: pendingClaims.count || 0,
                },
                users: {
                    total: totalUsers.count || 0,
                }
            }
        }
    } catch (error: any) {
        console.error('Error fetching admin overview stats:', error)
        return { success: false, error: error.message }
    }
}

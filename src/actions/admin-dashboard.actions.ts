'use server'

import { requireAdmin } from '@/lib/supabase/auth-utils'

/**
 * جلب إحصائيات النمو للوحة التحكم
 */
export async function getDashboardGrowthAction() {
    try {
        const { supabase } = await requireAdmin()

        // محاكاة بيانات النمو للأيام السبعة الأخيرة
        // في نظام حقيقي سنقوم بعمل COUNT مع GROUP BY date
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const [usersRes, adsRes, placesRes] = await Promise.all([
            supabase.from('profiles').select('created_at', { count: 'exact' }).gte('created_at', sevenDaysAgo.toISOString()),
            supabase.from('marketplace_items').select('created_at', { count: 'exact' }).gte('created_at', sevenDaysAgo.toISOString()),
            supabase.from('places').select('created_at', { count: 'exact' }).gte('created_at', sevenDaysAgo.toISOString())
        ])

        // Real growth data calculation (last 7 days)
        const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
        const chartData = []

        for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dayName = days[d.getDay()]
            const dateStr = d.toISOString().split('T')[0]

            // Count users joined on this specific day
            const dayCount = (usersRes.data || []).filter((u: any) => u.created_at.startsWith(dateStr)).length
            chartData.push({ day: dayName, value: dayCount })
        }

        return {
            success: true,
            stats: {
                newUsers: usersRes.count || 0,
                newAds: adsRes.count || 0,
                newPlaces: placesRes.count || 0,
                chartData
            }
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * جلب أرقام التنبيهات المعلقة لـ هيدر الإدارة
 */
export async function getPendingCountsAction() {
    try {
        const { supabase } = await requireAdmin()

        const [reportsRes, claimsRes, placesRes, marketplaceRes] = await Promise.all([
            supabase.from('reports').select('id', { count: 'exact' }).eq('status', 'pending'),
            supabase.from('business_claims').select('id', { count: 'exact' }).eq('status', 'pending'),
            supabase.from('places').select('id', { count: 'exact' }).eq('status', 'pending'),
            supabase.from('marketplace_items').select('id', { count: 'exact' }).eq('status', 'pending')
        ])

        return {
            success: true,
            counts: {
                reports: reportsRes.count || 0,
                claims: claimsRes.count || 0,
                places: placesRes.count || 0,
                marketplace: marketplaceRes.count || 0
            }
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

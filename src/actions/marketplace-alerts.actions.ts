"use server"

import { getAuthenticatedUser } from "@/lib/supabase/auth-utils"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const savedSearchSchema = z.object({
    query_text: z.string().min(2, 'كلمة البحث قصيرة جداً'),
    filters: z.record(z.string(), z.any()).default({})
})

/**
 * حفظ بحث معين للحصول على تنبيهات لاحقاً
 */
export async function createSavedSearchAction(data: { query_text: string, filters?: any }) {
    try {
        const { user, supabase, error: authError } = await getAuthenticatedUser()
        if (!user || authError) return { success: false, error: 'غير مصرح' }

        const parsed = savedSearchSchema.parse(data)

        const { error } = await supabase
            .from('saved_searches')
            .insert({
                user_id: user.id,
                query_text: parsed.query_text,
                filters: parsed.filters
            })

        if (error) throw error

        revalidatePath('/profile/saved-searches')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || 'فشل حفظ البحث' }
    }
}

/**
 * جلب الأبحاث المحفوظة للمستخدم
 */
export async function getMySavedSearchesAction() {
    try {
        const { user, supabase, error: authError } = await getAuthenticatedUser()
        if (!user || authError) return { success: false, error: 'غير مصرح' }

        const { data, error } = await supabase
            .from('saved_searches')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return { success: true, data }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * حذف بحث محفوظ
 */
export async function deleteSavedSearchAction(id: string) {
    try {
        const { user, supabase, error: authError } = await getAuthenticatedUser()
        if (!user || authError) return { success: false, error: 'غير مصرح' }

        const { error } = await supabase
            .from('saved_searches')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw error

        revalidatePath('/profile/saved-searches')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
/**
 * دالة لمعالجة التنبيهات (يفضل استدعاؤها عبر Cron Job)
 * تبحث عن إعلانات جديدة تطابق الأبحاث المحفوظة وترسل إشعارات
 */
export async function processAlertsAction() {
    try {
        const { user: _me, supabase, error: authError } = await getAuthenticatedUser()
        if (authError) return { success: false, error: 'Authorization failed' }

        // 1. جلب جميع الأبحاث النشطة التي تحتاج فحص (مثلاً كل ساعة)
        const { data: searches, error: searchError } = await supabase
            .from('saved_searches')
            .select('*, profiles(full_name)')
            .eq('is_active', true)
            .limit(100)

        if (searchError) throw searchError

        const results = []

        for (const search of searches) {
            // 2. البحث عن إعلانات جديدة منذ آخر فحص
            let query = supabase
                .from('marketplace_items')
                .select('id, title, slug, seller_id')
                .eq('status', 'active')
                .gt('created_at', search.last_checked_at)
                .ilike('title', `%${search.query_text}%`)

            if (search.filters?.category) {
                query = query.eq('category', search.filters.category)
            }

            const { data: matches, error: matchError } = await query

            if (matchError || !matches || matches.length === 0) continue

            // 3. إرسال إشعار للمستخدم بكل تطابق
            for (const item of matches) {
                await supabase.from('notifications').insert({
                    user_id: search.user_id,
                    title: 'تنبيه بحث محفوظ 🔍',
                    message: `تم العثور على إعلان جديد يطابق بحثك "${search.query_text}": ${item.title}`,
                    type: 'alert',
                    data: { item_id: item.id, slug: item.slug }
                })
            }

            // 4. تحديث وقت آخر فحص للبحث
            await supabase
                .from('saved_searches')
                .update({ last_checked_at: new Date().toISOString() })
                .eq('id', search.id)

            results.push({ search_id: search.id, matches: matches.length })
        }

        return { success: true, processed: results.length }
    } catch (error: any) {
        console.error('Alert processing error:', error)
        return { success: false, error: error.message }
    }
}

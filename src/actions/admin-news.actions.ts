'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth-utils'
import { revalidatePath } from 'next/cache'

/**
 * جلب جميع المقالات والأخبار
 */
export async function getAdminArticlesAction() {
    try {
        const { supabase } = await requireAdmin()

        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return { success: true, articles: data || [] }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * جلب جميع الفعاليات
 */
export async function getAdminEventsAction() {
    try {
        const { supabase } = await requireAdmin()

        const { data, error } = await supabase
            .from('events')
            .select('*, places(name)')
            .order('start_date', { ascending: false })

        if (error) throw error
        return { success: true, events: data || [] }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * حذف مقال
 */
export async function deleteArticleAction(id: string) {
    try {
        const { supabase } = await requireAdmin()
        const { error } = await supabase.from('articles').delete().eq('id', id)
        if (error) throw error

        revalidatePath('/admin/news')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * حذف فعالية
 */
export async function deleteEventAction(id: string) {
    try {
        const { supabase } = await requireAdmin()
        const { error } = await supabase.from('events').delete().eq('id', id)
        if (error) throw error

        revalidatePath('/admin/news')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * تحديث حالة النشر لمقال
 */
export async function toggleArticlePublishAction(id: string, currentStatus: boolean) {
    try {
        const { supabase } = await requireAdmin()
        const { error } = await supabase
            .from('articles')
            .update({ is_published: !currentStatus })
            .eq('id', id)

        if (error) throw error
        revalidatePath('/admin/news')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

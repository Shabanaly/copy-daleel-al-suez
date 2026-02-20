'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth-utils'
import { revalidatePath } from 'next/cache'

/**
 * جلب الأسئلة المُبلغ عنها
 */
export async function getFlaggedQuestionsAction() {
    try {
        const { supabase } = await requireAdmin()

        const { data, error } = await supabase
            .from('community_questions')
            .select('*, profiles:user_id(full_name, avatar_url)')
            .eq('is_flagged', true)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { success: true, questions: data || [] }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * جلب الأجوبة المُبلغ عنها
 */
export async function getFlaggedAnswersAction() {
    try {
        const { supabase } = await requireAdmin()

        const { data, error } = await supabase
            .from('community_answers')
            .select('*, profiles:user_id(full_name, avatar_url), question:community_questions(title)')
            .eq('is_flagged', true)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { success: true, answers: data || [] }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * تجاهل البلاغ (فك الفلاج)
 */
export async function dismissFlagAction(type: 'question' | 'answer', id: string) {
    try {
        const { supabase } = await requireAdmin()

        const table = type === 'question' ? 'community_questions' : 'community_answers'

        const { error } = await supabase
            .from(table)
            .update({ is_flagged: false })
            .eq('id', id)

        if (error) throw error
        revalidatePath('/admin/community')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * حذف المحتوى المخالف
 */
export async function deleteFlaggedContentAction(type: 'question' | 'answer', id: string) {
    try {
        const { supabase } = await requireAdmin()

        const table = type === 'question' ? 'community_questions' : 'community_answers'

        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id)

        if (error) throw error
        revalidatePath('/admin/community')
        revalidatePath('/community')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

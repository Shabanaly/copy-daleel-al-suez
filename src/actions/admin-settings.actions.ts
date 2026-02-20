'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/supabase/auth-utils'
import { revalidatePath } from 'next/cache'

/**
 * جلب جميع الإعدادات
 */
export async function getAdminSettingsAction() {
    try {
        const { supabase } = await requireSuperAdmin()

        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .order('group')

        if (error) throw error
        return { success: true, settings: data || [] }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * تحديث قيمة إعداد معين
 */
export async function updateSettingAction(key: string, value: string) {
    try {
        const { supabase } = await requireSuperAdmin()

        const { error } = await supabase
            .from('settings')
            .update({ value, updated_at: new Date().toISOString() })
            .eq('key', key)

        if (error) throw error

        revalidatePath('/admin/settings')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

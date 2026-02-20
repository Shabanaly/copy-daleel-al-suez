'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth-utils'
import { revalidatePath } from 'next/cache'

/**
 * جلب جميع المستخدمين مع إمكانية البحث
 */
export async function getUsersAction(search?: string) {
    try {
        const { supabase } = await requireAdmin()

        let query = supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (search) {
            query = query.or(`full_name.ilike.%${search}%,id.eq.${search}`)
        }

        const { data, error } = await query.limit(50)

        if (error) throw error
        return { success: true, users: data || [] }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * تحديث دور المستخدم
 */
export async function updateUserRoleAction(userId: string, newRole: 'user' | 'business_owner' | 'admin' | 'super_admin') {
    try {
        const { user: adminUser, supabase } = await requireAdmin()

        // منع المستخدم من تغيير دوره الخاص (لحماية النظام)
        if (userId === adminUser.id) {
            return { success: false, error: 'لا يمكنك تغيير رتبتك الخاصة من هنا' }
        }

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)

        if (error) throw error

        // تسجيل في الـ audit logs إذا كان موجوداً
        try {
            await supabase.from('audit_logs').insert({
                user_id: adminUser.id,
                action: 'user.role_change',
                table_name: 'profiles',
                record_id: userId,
                new_data: { role: newRole }
            })
        } catch (e) {
            console.warn('Audit log failed, but role was updated')
        }

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

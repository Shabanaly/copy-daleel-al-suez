'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth-utils'
import { revalidatePath } from 'next/cache'

/**
 * جلب جميع المستخدمين مع إحصائيات مبسطة وخيارات فلترة
 */
export async function getUsersAction(params?: {
    search?: string,
    role?: string,
    page?: number,
    limit?: number
}) {
    try {
        const { supabase } = await requireAdmin()
        const { search, role, page = 1, limit = 20 } = params || {}

        const from = (page - 1) * limit
        const to = from + limit - 1

        let query = supabase
            .from('profiles')
            .select('id, full_name, role, email, avatar_url, created_at, is_banned', { count: 'exact' })
            .order('created_at', { ascending: false })

        if (search) {
            query = query.or(`full_name.ilike.%${search}%,id.eq.${search},email.ilike.%${search}%`)
        }

        if (role && role !== 'all') {
            query = query.eq('role', role)
        }

        const { data, error, count } = await query.range(from, to)

        if (error) throw error
        return {
            success: true,
            users: data || [],
            count: count || 0,
            page,
            totalPages: count ? Math.ceil(count / limit) : 0
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * تحديث دور المستخدم
 */
export async function updateUserRoleAction(userId: string, newRole: 'user' | 'business_owner' | 'admin' | 'super_admin') {
    try {
        const { user: adminUser, supabase, profile: adminProfile } = await requireAdmin()

        // منع المستخدم من تغيير دوره الخاص (لحماية النظام)
        if (userId === adminUser.id) {
            return { success: false, error: 'لا يمكنك تغيير رتبتك الخاصة من هنا' }
        }

        // فقط الـ super_admin يمكنه ترقية مستخدم إلى admin أو super_admin
        if (['admin', 'super_admin'].includes(newRole) && adminProfile?.role !== 'super_admin') {
            return { success: false, error: 'فقط مدير النظام (Super Admin) يمكنه تعيين مدراء' }
        }

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)

        if (error) throw error

        // تسجيل في الـ audit logs
        try {
            await supabase.from('audit_logs').insert({
                user_id: adminUser.id,
                action: 'user.role_change',
                table_name: 'profiles',
                record_id: userId,
                new_data: { role: newRole }
            })
        } catch (e) {
            console.warn('Audit log failed')
        }

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * حظر/إلغاء حظر مستخدم
 */
export async function toggleUserBanAction(userId: string, isBanned: boolean) {
    try {
        const { user: adminUser, supabase, profile: adminProfile } = await requireAdmin()

        if (userId === adminUser.id) {
            return { success: false, error: 'لا يمكنك حظر نفسك' }
        }

        const { error } = await supabase
            .from('profiles')
            .update({ is_banned: isBanned })
            .eq('id', userId)

        if (error) throw error

        // تسجيل في الـ audit logs
        try {
            await supabase.from('audit_logs').insert({
                user_id: adminUser.id,
                action: isBanned ? 'user.ban' : 'user.unban',
                table_name: 'profiles',
                record_id: userId,
                new_data: { is_banned: isBanned }
            })
        } catch (e) {
            console.warn('Audit log failed')
        }

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * جلب سجلات النشاط لمستخدم معين
 */
export async function getUserActivityAction(userId: string) {
    try {
        const { supabase } = await requireAdmin()

        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) throw error
        return { success: true, logs: data || [] }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

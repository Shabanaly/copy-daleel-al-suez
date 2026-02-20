import { createClient } from "./server"

/**
 * يتحقق من جلسة المستخدم ويعيد الكائن والعميل
 */
export async function getAuthenticatedUser() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { user: null, supabase, error: 'يجب تسجيل الدخول أولاً' }
    }

    return { user, supabase, error: null }
}

/**
 * يتحقق من أن المستخدم مشرف (Admin)
 */
export async function requireAdmin() {
    const { user, supabase, error } = await getAuthenticatedUser()

    if (error || !user) {
        throw new Error(error || 'غير مصرح')
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profileError || !['admin', 'super_admin'].includes(profile?.role)) {
        throw new Error('هذه الصلاحية للمشرفين فقط')
    }

    return { user, supabase, profile }
}

/**
 * يتحقق من أن المستخدم مدير نظام (Super Admin)
 */
export async function requireSuperAdmin() {
    const { user, supabase, profile } = await requireAdmin()

    if (profile?.role !== 'super_admin') {
        throw new Error('هذه الصلاحية لمديري النظام فقط')
    }

    return { user, supabase, profile }
}

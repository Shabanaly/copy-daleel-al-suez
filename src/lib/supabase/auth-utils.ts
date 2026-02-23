import { redirect } from "next/navigation"
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

    // Check if user is banned
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_banned')
        .eq('id', user.id)
        .single()

    if (profile?.is_banned) {
        await supabase.auth.signOut()
        return { user: null, supabase, error: 'هذا الحساب محظور من دخول الموقع' }
    }

    return { user, supabase, error: null }
}

/**
 * يتحقق من أن المستخدم مشرف (Admin)
 */
export async function requireAdmin() {
    const { user, supabase, error } = await getAuthenticatedUser()

    if (error || !user) {
        redirect('/login')
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profileError || !['admin', 'super_admin'].includes(profile?.role)) {
        redirect('/')
    }

    return { user, supabase, profile }
}

/**
 * يتحقق من أن المستخدم مدير نظام (Super Admin)
 */
export async function requireSuperAdmin() {
    const { user, supabase, profile } = await requireAdmin()

    if (profile?.role !== 'super_admin') {
        redirect('/')
    }

    return { user, supabase, profile }
}

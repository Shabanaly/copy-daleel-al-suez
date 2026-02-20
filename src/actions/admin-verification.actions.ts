"use server"

import { getAuthenticatedUser } from "@/lib/supabase/auth-utils"
import { revalidatePath } from "next/cache"

/**
 * دالة للمشرفين لتوثيق حساب بائع (إضافة شارات الثقة)
 */
export async function verifySellerAction(userId: string, type: 'phone' | 'email', status: boolean = true) {
    try {
        const { user, supabase, error: authError } = await getAuthenticatedUser()
        if (!user || authError) return { success: false, error: 'غير مصرح' }

        // التحقق من أن المستخدم مشرف
        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!adminProfile || !['admin', 'super_admin'].includes(adminProfile.role)) {
            return { success: false, error: 'هذه الصلاحية للمشرفين فقط' }
        }

        const updateData: any = {}
        if (type === 'phone') updateData.is_verified_phone = status
        if (type === 'email') updateData.is_verified_email = status

        const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId)

        if (error) throw error

        revalidatePath('/marketplace')
        revalidatePath(`/profile/${userId}`) // إذا كانت هناك صفحة بروفايل عامة

        return { success: true }
    } catch (error: any) {
        console.error('Error verifying seller:', error)
        return { success: false, error: error.message || 'فشل توثيق الحساب' }
    }
}

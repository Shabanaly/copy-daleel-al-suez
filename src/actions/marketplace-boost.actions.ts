"use server"

import { getAuthenticatedUser } from "@/lib/supabase/auth-utils"
import { createClient } from "@/lib/supabase/server"
import { SupabaseMarketplaceRepository } from "@/data/repositories/supabase-marketplace.repository"
import { revalidatePath } from "next/cache"

/**
 * يسمح للمستخدم بعمل "Bump" لإعلانه ليرفعه للأعلى
 * يتم التحقق من الملكية داخل الـ Repository
 */
export async function bumpMarketplaceItemAction(itemId: string) {
    try {
        const { user, supabase, error: authError } = await getAuthenticatedUser()
        if (!user || authError) return { success: false, error: 'غير مصرح' }

        const repository = new SupabaseMarketplaceRepository(supabase)

        // التحقق من وجود الإعلان وحالته (اختياري هنا، الـ Repository يتحقق من الملكية)
        await repository.bumpItem(itemId, user.id)

        // تسجيل العملية في الـ engagement_logs (اختياري للتحليل)
        await supabase.from('engagement_logs').insert({
            item_id: itemId,
            user_id: user.id,
            event_type: 'bump'
        })

        revalidatePath('/marketplace')
        revalidatePath(`/marketplace/item/${itemId}`)
        revalidatePath('/profile/my-ads')

        return { success: true }
    } catch (error: any) {
        console.error('Error bumping item:', error)
        return { success: false, error: error.message || 'فشل رفع الإعلان' }
    }
}

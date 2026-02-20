'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth-utils'
import { revalidatePath } from 'next/cache'
import { SupabaseBusinessClaimRepository } from '@/data/repositories/supabase-business-claim.repository'

async function getClaimsRepository() {
    const supabase = await createClient()
    return new SupabaseBusinessClaimRepository(supabase)
}

/**
 * جلب جميع طلبات التوثيق المعلقة
 */
export async function getPendingClaimsAction() {
    try {
        const { supabase } = await requireAdmin()

        const { data, error } = await supabase
            .from('business_claims')
            .select('*, place:places(name, slug)')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })

        if (error) throw error
        return { success: true, claims: data || [] }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * تحديث حالة طلب التوثيق (قبول/رفض)
 */
export async function processClaimAction(claimId: string, status: 'approved' | 'rejected', reason?: string) {
    try {
        const { user, supabase } = await requireAdmin()

        const repository = new SupabaseBusinessClaimRepository(supabase)
        await repository.updateClaimStatus(claimId, status, user.id, reason)

        // إذا تمت الموافقة، نقوم بتحديث صاحب المنشأة في جدول الأماكن
        if (status === 'approved') {
            const { data: claim } = await supabase
                .from('business_claims')
                .select('place_id, user_id')
                .eq('id', claimId)
                .single()

            if (claim) {
                // تحديث جدول الأماكن
                await supabase
                    .from('places')
                    .update({
                        owner_id: claim.user_id,
                        is_claimed: true,
                        claimed_at: new Date().toISOString()
                    })
                    .eq('id', claim.place_id)

                // تحويل دور المستخدم إلى business_owner إذا كان مستخدماً عادياً
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', claim.user_id)
                    .single()

                if (profile?.role === 'user') {
                    await supabase
                        .from('profiles')
                        .update({ role: 'business_owner' })
                        .eq('id', claim.user_id)
                }
            }
        }

        revalidatePath('/admin/claims')
        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

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

        // جلب بيانات الطلب والمكان للإشعار
        const { data: claim } = await supabase
            .from('business_claims')
            .select('place_id, user_id, places(name, slug)')
            .eq('id', claimId)
            .single()

        if (claim) {
            const placeData = claim.places as any;
            const placeName = placeData?.name || 'نشاطك التجاري';
            const { createNotificationAction } = await import('./notifications.actions')

            if (status === 'approved') {
                // تحديث جدول الأماكن
                await supabase
                    .from('places')
                    .update({
                        owner_id: claim.user_id,
                        is_claimed: true,
                        claimed_at: new Date().toISOString()
                    })
                    .eq('id', claim.place_id)

                // تحويل دور المستخدم
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

                // إرسال إشعار النجاح
                await createNotificationAction({
                    userId: claim.user_id,
                    title: 'تم توثيق نشاطك التجاري بنجاح! 🎉',
                    message: `تهانينا! تم قبول طلب توثيقك لـ "${placeName}". يمكنك الآن إدارة النشاط وإضافة العروض.`,
                    type: 'status_update',
                    data: { placeId: claim.place_id, slug: placeData?.slug, status: 'approved' }
                })
            } else if (status === 'rejected') {
                // إرسال إشعار الرفض
                await createNotificationAction({
                    userId: claim.user_id,
                    title: 'بخصوص طلب توثيق النشاط التجاري ⚠️',
                    message: `نعتذر، لم يتم قبول طلب توثيق "${placeName}". ${reason ? `السبب: ${reason}` : 'يرجى التأكد من البيانات والمحاولة لاحقاً.'}`,
                    type: 'status_update',
                    data: { placeId: claim.place_id, status: 'rejected' }
                })
            }
        }

        revalidatePath('/admin/claims')
        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

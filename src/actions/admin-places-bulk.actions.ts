'use server'

import { requireAdmin } from '@/lib/supabase/auth-utils'
import { revalidatePath } from 'next/cache'

/**
 * تنفيذ إجراءات جماعية على الأماكن
 */
export async function bulkUpdatePlacesAction(placeIds: string[], action: 'activate' | 'deactivate' | 'delete') {
    try {
        const { supabase, user } = await requireAdmin()

        if (!placeIds.length) return { success: false, error: 'لم يتم تحديد أي أماكن' }

        if (action === 'delete') {
            const { error } = await supabase
                .from('places')
                .delete()
                .in('id', placeIds)

            if (error) throw error
        } else {
            const { error } = await supabase
                .from('places')
                .update({ status: action === 'activate' ? 'active' : 'inactive' })
                .in('id', placeIds)

            if (error) throw error
        }

        // تسجيل في الـ audit logs
        try {
            await supabase.from('audit_logs').insert({
                user_id: user.id,
                action: `places.bulk_${action}`,
                table_name: 'places',
                new_data: { count: placeIds.length, ids: placeIds }
            })
        } catch (e) {
            console.warn('Audit log failed')
        }

        revalidatePath('/content-admin/places')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

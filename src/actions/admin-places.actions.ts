'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { PlaceMapper } from "@/data/mappers/place.mapper"
import { requireAdmin } from "@/lib/supabase/auth-utils"

export async function getAdminPlacesAction(filters?: {
    status?: string
    categoryId?: string
    query?: string
}) {
    try {
        await requireAdmin()
        const supabase = await createClient()

        let query = supabase
            .from('places')
            .select('*, categories(name), areas(name)')
            .order('created_at', { ascending: false })

        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status)
        }
        if (filters?.categoryId && filters.categoryId !== 'all') {
            query = query.eq('category_id', filters.categoryId)
        }
        if (filters?.query) {
            query = query.ilike('name', `%${filters.query}%`)
        }

        const { data, error } = await query

        if (error) throw error

        return {
            success: true,
            places: PlaceMapper.toEntities(data)
        }
    } catch (error) {
        console.error('Error fetching admin places:', error)
        return { success: false, message: 'فشل في تحميل الأماكن' }
    }
}

export async function transferPlaceOwnershipAction(placeId: string, newOwnerId: string) {
    try {
        const { user: adminUser } = await requireAdmin()
        const supabase = await createClient()

        // تحديث مالك المكان
        const { error } = await supabase
            .from('places')
            .update({ owner_id: newOwnerId, updated_at: new Date().toISOString() })
            .eq('id', placeId)

        if (error) throw error

        // سجل العملية في audit_logs (اختياري لكن مفيد للتتبع)
        try {
            await supabase.from('audit_logs').insert({
                user_id: adminUser.id,
                action: 'place.transfer_ownership',
                table_name: 'places',
                record_id: placeId,
                new_data: { owner_id: newOwnerId }
            })
        } catch (e) {
            console.warn('Audit log failed for transferPlaceOwnershipAction')
        }

        revalidatePath('/content-admin/places')
        return { success: true, message: 'تم نقل ملكية المكان بنجاح' }
    } catch (error) {
        console.error('Error transferring place ownership:', error)
        return { success: false, message: 'فشل في نقل ملكية المكان' }
    }
}

export async function updatePlaceStatusAction(id: string, status: 'active' | 'pending' | 'inactive') {
    try {
        await requireAdmin()
        const supabase = await createClient()

        // جلب بيانات المكان قبل التحديث للإشعار
        const { data: place } = await supabase
            .from('places')
            .select('name, slug, created_by, owner_id')
            .eq('id', id)
            .single()

        const { error } = await supabase
            .from('places')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (error) throw error

        // إرسال إشعار للمستخدم إذا تغيرت الحالة
        if (place) {
            const targetUserId = place.owner_id || place.created_by
            if (targetUserId) {
                const { createNotificationAction } = await import('./notifications.actions')

                if (status === 'active') {
                    await createNotificationAction({
                        userId: targetUserId,
                        title: 'تم نشر مكانك بنجاح! 🚀',
                        message: `رائع! تم تفعيل ونشر "${place.name}" وهو الآن متاح للجميع على المنصة.`,
                        type: 'status_update',
                        data: { placeId: id, slug: place.slug, status: 'active' }
                    })
                } else if (status === 'inactive') {
                    await createNotificationAction({
                        userId: targetUserId,
                        title: 'تم إيقاف نشاط المكان مؤقتاً ⚠️',
                        message: `تم تغيير حالة "${place.name}" إلى غير نشط من قبل الإدارة.`,
                        type: 'status_update',
                        data: { placeId: id, status: 'inactive' }
                    })
                }
            }
        }

        revalidatePath('/content-admin/places')
        revalidatePath('/places')
        return { success: true, message: 'تم تحديث حالة المكان بنجاح' }
    } catch (error) {
        console.error('Error updating place status:', error)
        return { success: false, message: 'فشل في تحديث حالة المكان' }
    }
}

export async function deletePlaceAction(id: string) {
    try {
        const { user } = await requireAdmin()
        const supabase = await createClient()

        const { error } = await supabase
            .from('places')
            .delete()
            .eq('id', id)

        if (error) throw error

        // سجل العمليات
        try {
            await supabase.from('audit_logs').insert({
                user_id: user.id,
                action: 'place.delete',
                table_name: 'places',
                record_id: id
            })
        } catch (e) { }

        revalidatePath('/content-admin/places')
        revalidatePath('/places')
        return { success: true, message: 'تم حذف المكان بنجاح' }
    } catch (error) {
        console.error('Error deleting place:', error)
        return { success: false, message: 'فشل في حذف المكان' }
    }
}

export async function bulkUpdatePlacesStatusAction(ids: string[], status: 'active' | 'pending' | 'inactive') {
    try {
        await requireAdmin()
        const supabase = await createClient()

        // جلب بيانات الأماكن قبل التحديث للإشعارات
        const { data: places } = await supabase
            .from('places')
            .select('id, name, slug, created_by, owner_id')
            .in('id', ids)

        const { error } = await supabase
            .from('places')
            .update({ status, updated_at: new Date().toISOString() })
            .in('id', ids)

        if (error) throw error

        // إرسال إشعارات للمستخدمين
        if (places && places.length > 0 && (status === 'active' || status === 'inactive')) {
            const { createNotificationAction } = await import('./notifications.actions')

            for (const place of places) {
                const targetUserId = place.owner_id || place.created_by
                if (!targetUserId) continue

                if (status === 'active') {
                    await createNotificationAction({
                        userId: targetUserId,
                        title: 'تم تفعيل مكانك بنجاح! 🚀',
                        message: `رائع! تم تفعيل "${place.name}" وهو الآن متاح للجميع على المنصة.`,
                        type: 'status_update',
                        data: { placeId: place.id, slug: place.slug, status: 'active' }
                    })
                } else if (status === 'inactive') {
                    await createNotificationAction({
                        userId: targetUserId,
                        title: 'تم إيقاف نشاط المكان مؤقتاً ⚠️',
                        message: `تم تغيير حالة "${place.name}" إلى غير نشط من قبل الإدارة.`,
                        type: 'status_update',
                        data: { placeId: place.id, status: 'inactive' }
                    })
                }
            }
        }

        revalidatePath('/content-admin/places')
        revalidatePath('/places')
        return { success: true, message: `تم تحديث حالة ${ids.length} مكان بنجاح` }
    } catch (error) {
        console.error('Error bulk updating places:', error)
        return { success: false, message: 'فشل في تحديث الأماكن' }
    }
}

export async function bulkDeletePlacesAction(ids: string[]) {
    try {
        const { user } = await requireAdmin()
        const supabase = await createClient()

        const { error } = await supabase
            .from('places')
            .delete()
            .in('id', ids)

        if (error) throw error

        // سجل العمليات
        try {
            await supabase.from('audit_logs').insert({
                user_id: user.id,
                action: 'places.bulk_delete',
                table_name: 'places',
                new_data: { count: ids.length, ids }
            })
        } catch (e) { }

        revalidatePath('/content-admin/places')
        revalidatePath('/places')
        return { success: true, message: `تم حذف ${ids.length} مكان بنجاح` }
    } catch (error) {
        console.error('Error bulk deleting places:', error)
        return { success: false, message: 'فشل في حذف الأماكن المختارة' }
    }
}

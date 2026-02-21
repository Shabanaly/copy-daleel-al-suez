'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth-utils'
import { revalidatePath } from 'next/cache'
import { createNotificationAction } from './notifications.actions'


// ========== إحصائيات الماركت ==========

export interface AdminStats {
    totalActive: number
    totalPending: number
    totalRejected: number
    totalSold: number
    totalExpired: number
    todayNew: number
    totalReports: number
}

export async function getAdminStatsAction(): Promise<{ success: boolean; stats?: AdminStats; error?: string }> {
    try {
        const { supabase } = await requireAdmin()

        const [active, pending, rejected, sold, expired, todayNew, reports] = await Promise.all([
            supabase.from('marketplace_items').select('id', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('marketplace_items').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('marketplace_items').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
            supabase.from('marketplace_items').select('id', { count: 'exact', head: true }).eq('status', 'sold'),
            supabase.from('marketplace_items').select('id', { count: 'exact', head: true }).eq('status', 'expired'),
            supabase.from('marketplace_items').select('id', { count: 'exact', head: true })
                .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
            supabase.from('reports').select('id', { count: 'exact', head: true }).eq('target_type', 'item').eq('status', 'pending'),
        ])

        return {
            success: true,
            stats: {
                totalActive: active.count || 0,
                totalPending: pending.count || 0,
                totalRejected: rejected.count || 0,
                totalSold: sold.count || 0,
                totalExpired: expired.count || 0,
                todayNew: todayNew.count || 0,
                totalReports: reports.count || 0,
            }
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// ========== جلب الإعلانات المعلقة ==========

export interface PendingItem {
    id: string
    title: string
    description: string
    price: number
    category: string
    condition: string | null
    images: string[]
    seller_id: string
    seller_phone: string
    created_at: string
    slug: string
    seller?: { full_name: string | null; avatar_url: string | null }
}

export async function getPendingItemsAction(): Promise<{ success: boolean; items?: PendingItem[]; error?: string }> {
    try {
        const { supabase } = await requireAdmin()

        const { data, error } = await supabase
            .from('marketplace_items')
            .select('*, profiles:seller_id(full_name, avatar_url)')
            .eq('status', 'pending')
            .order('created_at', { ascending: true }) // أقدم أولاً

        if (error) throw error

        return {
            success: true,
            items: (data || []).map(item => ({
                id: item.id,
                title: item.title,
                description: item.description,
                price: item.price,
                category: item.category,
                condition: item.condition,
                images: item.images || [],
                seller_id: item.seller_id,
                seller_phone: item.seller_phone,
                created_at: item.created_at,
                slug: item.slug,
                seller: item.profiles as any,
            }))
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// ========== قبول إعلان ==========

export async function approveItemAction(itemId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { supabase, user } = await requireAdmin()

        const { error } = await supabase
            .from('marketplace_items')
            .update({
                status: 'active',
                updated_at: new Date().toISOString(),
            })
            .eq('id', itemId)
            .eq('status', 'pending')

        if (error) throw error

        // Notifications are handled automatically by the DB trigger 'trg_notify_marketplace_status'
        // in final_marketplace_optimizations.sql

        // تسجيل في audit_logs
        await supabase.from('audit_logs').insert({
            user_id: user.id,
            action: 'approve_item',
            table_name: 'marketplace_items',
            record_id: itemId,
        })

        revalidatePath('/marketplace')
        revalidatePath('/marketplace/admin')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// ========== رفض إعلان ==========

export async function rejectItemAction(itemId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (!reason || reason.trim().length < 3) {
            return { success: false, error: 'سبب الرفض مطلوب (3 حروف على الأقل)' }
        }

        const { supabase, user } = await requireAdmin()

        const { error } = await supabase
            .from('marketplace_items')
            .update({
                status: 'rejected',
                rejection_reason: reason.trim(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', itemId)
            .eq('status', 'pending')

        if (error) throw error

        // Notifications are handled automatically by the DB trigger 'trg_notify_marketplace_status'
        // in final_marketplace_optimizations.sql

        // تسجيل في audit_logs
        await supabase.from('audit_logs').insert({
            user_id: user.id,
            action: 'reject_item',
            table_name: 'marketplace_items',
            record_id: itemId,
            new_data: { reason: reason.trim() },
        })

        revalidatePath('/marketplace/admin')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// ========== تمييز إعلان (Featured) ==========

export async function featureItemAction(itemId: string, featured: boolean): Promise<{ success: boolean; error?: string }> {
    try {
        const { supabase } = await requireAdmin()

        const { error } = await supabase
            .from('marketplace_items')
            .update({
                is_featured: featured,
                updated_at: new Date().toISOString(),
            })
            .eq('id', itemId)

        if (error) throw error

        revalidatePath('/marketplace')
        revalidatePath('/marketplace/admin')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// ========== حذف إعلان (أدمن) ==========

export async function adminDeleteItemAction(itemId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { supabase, user } = await requireAdmin()

        // حذف الصور من Storage أولاً
        const { data: item } = await supabase
            .from('marketplace_items')
            .select('title, images, seller_id')
            .eq('id', itemId)
            .single()

        if (item?.images && Array.isArray(item.images)) {
            const paths = item.images
                .map((url: string) => {
                    const match = url.match(/marketplace\/[^?]+/)
                    return match ? match[0] : null
                })
                .filter(Boolean) as string[]

            if (paths.length > 0) {
                await supabase.storage.from('marketplace-ads').remove(paths)
            }
        }

        const { error } = await supabase
            .from('marketplace_items')
            .delete()
            .eq('id', itemId)

        if (error) throw error

        // إرسال إشعار للمستخدم
        if (item && item.seller_id) {
            await createNotificationAction({
                userId: item.seller_id,
                title: 'تنبيه: تم حذف إعلانك ⚠️',
                message: `قام أحد المشرفين بحذف إعلانك "${item.title || 'غير معروف'}" لانتهاكه شروط الاستخدام.`,
                type: 'system_alert',
                data: { itemId }
            })
        }

        // تسجيل في audit_logs
        await supabase.from('audit_logs').insert({
            user_id: user.id,
            action: 'admin_delete_item',
            table_name: 'marketplace_items',
            record_id: itemId,
        })

        revalidatePath('/marketplace')
        revalidatePath('/marketplace/admin')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/utils/sanitize'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { SupabaseNotificationRepository } from '@/data/repositories/supabase-notification.repository'
import { Notification as DomainNotification } from '@/domain/entities/notification'

export interface Notification {
    id: string
    user_id: string
    title: string
    message: string
    type: string
    is_read: boolean
    data: any
    created_at: string
}

export type CreateNotificationParams = {
    userId: string
    title: string
    message: string
    type: string
    data?: any
}

// Helper to map domain entity to UI-friendly object
function mapToUINotification(n: DomainNotification): Notification {
    return {
        id: n.id,
        user_id: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        is_read: n.isRead,
        data: n.data,
        created_at: n.createdAt
    }
}

// -----------------------------------------------------------------------------
// Public Actions (Called by Client)
// -----------------------------------------------------------------------------

export async function getNotificationsAction(page = 1, limit = 10) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: 'Unauthorized' }

        const repository = new SupabaseNotificationRepository(supabase)
        const from = (page - 1) * limit

        const notifications = await repository.getUserNotifications(user.id, limit, from)

        // We still need the total count for hasMore, repository currently doesn't return count with notifications
        // Let's get the unread count or a total count if needed. 
        // For simplicity, let's keep the legacy total count fetch for now or update repository.
        const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        return {
            success: true,
            notifications: notifications.map(mapToUINotification),
            total: count || 0,
            hasMore: (count || 0) > from + limit
        }
    } catch (error: any) {
        console.error('Error fetching notifications:', error)
        return { success: false, error: error.message }
    }
}

export async function getUnreadNotificationsCountAction() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, count: 0 }

        const repository = new SupabaseNotificationRepository(supabase)
        const count = await repository.getUnreadCount(user.id)

        return { success: true, count }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function markNotificationAsReadAction(notificationId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: 'Unauthorized' }

        const repository = new SupabaseNotificationRepository(supabase)
        await repository.markAsRead(notificationId)

        revalidatePath('/notifications')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function markAllNotificationsAsReadAction() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: 'Unauthorized' }

        const repository = new SupabaseNotificationRepository(supabase)
        await repository.markAllAsRead(user.id)

        revalidatePath('/notifications')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// -----------------------------------------------------------------------------
// Internal Actions (Called by other Server Actions / Webhooks)
// -----------------------------------------------------------------------------

export async function createNotificationAction(params: CreateNotificationParams) {
    try {
        const repository = new SupabaseNotificationRepository(supabaseAdmin)
        const notification = await repository.create({
            userId: params.userId,
            title: params.title,
            message: params.message,
            type: params.type as any,
            data: params.data
        })

        return { success: true, notification: mapToUINotification(notification) }
    } catch (error: any) {
        console.error('❌ createNotificationAction failed:', error)
        return { success: false, error: error.message }
    }
}

/** Validates, sanitizes and submits contact form - use this instead of notifyAdminsAction for contact form */
export async function submitContactFormAction(data: { name: string; email: string; message: string }) {
    const name = sanitizeText(data.name || '').trim()
    const email = sanitizeText(data.email || '').trim()
    const message = sanitizeText(data.message || '').trim()

    if (!name || name.length < 2) return { success: false, error: 'الاسم يجب أن يكون حرفين على الأقل' }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: 'البريد الإلكتروني غير صحيح' }
    if (!message || message.length < 10) return { success: false, error: 'الرسالة يجب أن تكون 10 أحرف على الأقل' }
    if (message.length > 2000) return { success: false, error: 'الرسالة طويلة جداً' }

    return notifyAdminsAction({
        title: 'رسالة تواصل جديدة ✉️',
        message: `وصلت رسالة جديدة من ${name} (${email})`,
        type: 'contact_message',
        data: { name, email, message, url: '/content-admin/notifications' }
    })
}

export async function notifyAdminsAction(params: Omit<CreateNotificationParams, 'userId'>) {
    try {
        const [profilesRes, adminsTableRes] = await Promise.all([
            supabaseAdmin
                .from('profiles')
                .select('id')
                .or('role.ilike.admin,role.ilike.super_admin'),
            supabaseAdmin
                .from('admins')
                .select('user_id')
        ])

        if (profilesRes.error) throw profilesRes.error

        const adminIds = new Set<string>()
        profilesRes.data?.forEach(p => adminIds.add(p.id))
        adminsTableRes.data?.forEach(a => adminIds.add(a.user_id))

        if (adminIds.size === 0) return { success: false, error: 'No admins found' }

        const repository = new SupabaseNotificationRepository(supabaseAdmin)

        // We use bulk insert here which repository doesn't have yet. 
        // For performance, we keep the bulk insert but we can wrap it or just use supabaseAdmin here as it's a specialized case.
        // Actually, let's keep the bulk insert logic here but align data keys.
        const notifications = Array.from(adminIds).map(adminId => ({
            user_id: adminId,
            title: params.title,
            message: params.message,
            type: params.type,
            data: params.data || {},
            is_read: false
        }))

        const { error: insertError } = await supabaseAdmin
            .from('notifications')
            .insert(notifications)

        if (insertError) throw insertError

        return { success: true }
    } catch (error: any) {
        console.error('❌ notifyAdminsAction failed:', error)
        return { success: false, error: error.message }
    }
}

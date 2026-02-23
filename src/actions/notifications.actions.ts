'use server'

import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/utils/sanitize'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { SupabaseNotificationRepository } from '@/data/repositories/supabase-notification.repository'
import { Notification as DomainNotification } from '@/domain/entities/notification'
import { ActionResult } from '@/types/actions'
import { headers } from 'next/headers'
import { requireAdmin } from '@/lib/supabase/auth-utils'

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

        // Send Email for Critical Types
        if (['status_update', 'business_claim', 'admin_alert'].includes(params.type)) {
            try {
                const { data: userData } = await supabaseAdmin.auth.admin.getUserById(params.userId)
                if (userData?.user?.email) {
                    const { sendEmail } = await import('@/lib/email')
                    await sendEmail({
                        to: userData.user.email,
                        subject: params.title,
                        html: `
                            <div dir="rtl" style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                                <h1 style="color: #6366f1;">دليل السويس</h1>
                                <h2>${params.title}</h2>
                                <p style="font-size: 16px; line-height: 1.6;">${params.message}</p>
                                ${params.data?.url ? `<a href="${process.env.NEXT_PUBLIC_SITE_URL}${params.data.url}" style="display: inline-block; padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">عرض التفاصيل</a>` : ''}
                                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
                                <p style="font-size: 12px; color: #888;">© 2024 دليل السويس. جميع الحقوق محفوظة.</p>
                            </div>
                        `
                    })
                }
            } catch (emailErr) {
                console.error('📧 Email sending failed:', emailErr)
            }
        }

        return { success: true, notification: mapToUINotification(notification) }
    } catch (error: any) {
        console.error('❌ createNotificationAction failed:', error)
        return { success: false, error: error.message }
    }
}

/** Validates, sanitizes and submits contact form - stores in DB and notifies admins */
export async function submitContactFormAction(data: { name: string; email: string; message: string }): Promise<ActionResult> {
    const name = sanitizeText(data.name || '').trim()
    const email = sanitizeText(data.email || '').trim()
    const message = sanitizeText(data.message || '').trim()

    if (!name || name.length < 2) return { success: false, error: 'الاسم يجب أن يكون حرفين على الأقل' }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: 'البريد الإلكتروني غير صحيح' }
    if (!message || message.length < 10) return { success: false, error: 'الرسالة يجب أن تكون 10 أحرف على الأقل' }
    if (message.length > 2000) return { success: false, error: 'الرسالة طويلة جداً' }

    try {
        const headerList = await headers()
        const ip = headerList.get('x-forwarded-for')?.split(',')[0] || headerList.get('x-real-ip') || 'unknown'

        // 1. Simple Rate Limit Check (max 3 messages per hour per email or IP)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
        const { count, error: countError } = await supabaseAdmin
            .from('contact_messages')
            .select('*', { count: 'exact', head: true })
            .or(`email.eq.${email},ip_address.eq.${ip}`)
            .gt('created_at', oneHourAgo)

        if (!countError && count && count >= 3) {
            return { success: false, error: 'لقد تجاوزت حد الإرسال المسموح به (3 رسائل في الساعة). يرجى المحاولة لاحقاً.' }
        }

        // 2. Store in Database
        const { error: insertError } = await supabaseAdmin
            .from('contact_messages')
            .insert({ name, email, message, ip_address: ip })

        if (insertError) throw insertError

        // 3. Notify Admins
        await notifyAdminsAction({
            title: 'رسالة تواصل جديدة ✉️',
            message: `وصلت رسالة جديدة من ${name} (${email})`,
            type: 'contact_message',
            data: { name, email, message, url: '/content-admin/notifications' }
        })

        return { success: true, message: 'تم إرسال رسالتك بنجاح' }
    } catch (error: any) {
        console.error('submitContactFormAction failed:', error)
        return { success: false, error: 'حدث خطأ أثناء حفظ الرسالة' }
    }
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

// -----------------------------------------------------------------------------
// Admin Contact Messages CRUD
// -----------------------------------------------------------------------------

export async function getContactMessagesAction(filters?: { isRead?: boolean }, page = 1, limit = 20) {
    try {
        await requireAdmin();
        const from = (page - 1) * limit;

        let query = supabaseAdmin
            .from('contact_messages')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, from + limit - 1);

        if (filters?.isRead !== undefined) {
            query = query.eq('is_read', filters.isRead);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            success: true,
            messages: data || [],
            total: count || 0,
            hasMore: (count || 0) > from + limit
        };
    } catch (error: any) {
        console.error('getContactMessagesAction failed:', error);
        return { success: false, error: error.message };
    }
}

export async function markContactMessageAsReadAction(id: string, isRead: boolean = true) {
    try {
        await requireAdmin();
        const { error } = await supabaseAdmin
            .from('contact_messages')
            .update({ is_read: isRead })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin/contact');
        return { success: true };
    } catch (error: any) {
        console.error('markContactMessageAsReadAction failed:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteContactMessageAction(id: string) {
    try {
        await requireAdmin();
        const { error } = await supabaseAdmin
            .from('contact_messages')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin/contact');
        return { success: true };
    } catch (error: any) {
        console.error('deleteContactMessageAction failed:', error);
        return { success: false, error: error.message };
    }
}

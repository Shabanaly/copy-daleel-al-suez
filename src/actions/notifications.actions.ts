'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

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

// -----------------------------------------------------------------------------
// Public Actions (Called by Client)
// -----------------------------------------------------------------------------

export async function getNotificationsAction(page = 1, limit = 10) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: 'Unauthorized' }

        const from = (page - 1) * limit
        const to = from + limit - 1

        const { data, count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(from, to)

        if (error) throw error

        return {
            success: true,
            notifications: data as Notification[],
            total: count || 0,
            hasMore: (count || 0) > to + 1
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

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false)

        if (error) throw error

        return { success: true, count: count || 0 }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function markNotificationAsReadAction(notificationId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: 'Unauthorized' }

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .eq('user_id', user.id)

        if (error) throw error

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

        if (!user) {
            console.error('❌ markAllNotificationsAsReadAction: User not found')
            return { success: false, error: 'Unauthorized' }
        }

        console.log('🔄 markAllNotificationsAsReadAction started for user:', user.id)

        const { error, count } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false)
            .select('id')

        if (error) {
            console.error('❌ markAllNotificationsAsReadAction DB Error:', error)
            throw error
        }

        console.log(`✅ markAllNotificationsAsReadAction success. Updated ${count} rows.`)

        revalidatePath('/notifications')
        return { success: true }
    } catch (error: any) {
        console.error('❌ markAllNotificationsAsReadAction Failed:', error.message)
        return { success: false, error: error.message }
    }
}

// -----------------------------------------------------------------------------
// Internal Actions (Called by other Server Actions / Webhooks)
// -----------------------------------------------------------------------------

/**
 * Creates a notification safely using Admin privileges.
 * This should ONLY be called from server-side logic (e.g. after approving an item).
 */
export async function createNotificationAction(params: CreateNotificationParams) {
    try {
        const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
        console.log('🔔 createNotificationAction started', {
            userId: params.userId,
            type: params.type,
            hasServiceKey: hasServiceKey ? 'YES' : 'NO'
        });

        if (!hasServiceKey) {
            console.error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing!');
            return { success: false, error: 'Configuration Error: Service Key Missing' };
        }

        // Use supabaseAdmin to bypass RLS for system notifications (admin -> user)
        const { data: inserted, error } = await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: params.userId,
                title: params.title,
                message: params.message,
                type: params.type,
                data: params.data || {},
                is_read: false
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error creating notification:', error);
            throw error;
        }

        console.log('✅ Notification PERSISTED successfully:', inserted);
        return { success: true, notification: inserted };
    } catch (error: any) {
        console.error('❌ createNotificationAction failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sends a notification to all admins (admin & super_admin).
 * Useful for new items, reports, system alerts.
 */
export async function notifyAdminsAction(params: Omit<CreateNotificationParams, 'userId'>) {
    try {
        console.log('🔔 notifyAdminsAction started', params.title)

        // 1. Get all admin IDs
        const { data: admins, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .in('role', ['admin', 'super_admin'])

        if (fetchError) {
            console.error('❌ Error fetching admins:', fetchError)
            throw fetchError
        }

        console.log('👥 Admins found:', admins?.length || 0)

        if (!admins || admins.length === 0) {
            console.warn('⚠️ No admins found to notify')
            return { success: true, message: 'No admins found' }
        }

        // 2. Prepare notifications payload
        const notifications = admins.map(admin => ({
            user_id: admin.id,
            title: params.title,
            message: params.message,
            type: params.type,
            data: params.data || {},
            is_read: false
        }))

        // 3. Bulk insert
        const { error: insertError } = await supabaseAdmin
            .from('notifications')
            .insert(notifications)

        if (insertError) {
            console.error('❌ Error inserting notifications:', insertError)
            throw insertError
        }

        console.log('✅ Notifications sent successfully to', notifications.length, 'admins')
        return { success: true }
    } catch (error: any) {
        console.error('❌ notifyAdminsAction failed:', error)
        return { success: false, error: error.message }
    }
}

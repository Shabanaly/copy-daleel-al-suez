import { SupabaseClient } from "@supabase/supabase-js";
import {
    Notification,
    NotificationPreferences,
    CreateNotificationDTO,
    UpdatePreferencesDTO
} from "@/domain/entities/notification";
import { INotificationRepository } from "@/domain/repositories/notification.repository";

export class SupabaseNotificationRepository implements INotificationRepository {
    constructor(private supabase?: SupabaseClient) { }

    async create(data: CreateNotificationDTO, client?: unknown): Promise<Notification> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data: created, error } = await supabase
            .from('notifications')
            .insert({
                user_id: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                data: data.data || {},
                is_read: false
            })
            .select()
            .single();

        if (error) throw error;
        return this.mapToNotification(created);
    }

    async getUserNotifications(userId: string, limit?: number, offset?: number, client?: unknown): Promise<Notification[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        let query = supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (limit) query = query.limit(limit);
        if (offset && limit) query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map(row => this.mapToNotification(row));
    }

    async getUnreadCount(userId: string, client?: unknown): Promise<number> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return 0;

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    }

    async markAsRead(id: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from('notifications')
            .update({
                is_read: true,
                // Removed read_at as it doesn't exist in schema.sql
            })
            .eq('id', id);

        if (error) throw error;
    }

    async markAllAsRead(userId: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from('notifications')
            .update({
                is_read: true,
            })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;
    }

    async delete(id: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async getPreferences(userId: string, client?: unknown): Promise<NotificationPreferences | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;

        return this.mapToPreferences(data);
    }

    async updatePreferences(userId: string, data: UpdatePreferencesDTO, client?: unknown): Promise<NotificationPreferences> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const updates: any = {};

        if (data.emailNotifications !== undefined) updates.email_notifications = data.emailNotifications;
        if (data.pushNotifications !== undefined) updates.push_notifications = data.pushNotifications;
        if (data.notifyNewReviews !== undefined) updates.notify_new_reviews = data.notifyNewReviews;
        if (data.notifyReviewReplies !== undefined) updates.notify_review_replies = data.notifyReviewReplies;
        if (data.notifyFavoriteUpdates !== undefined) updates.notify_favorite_updates = data.notifyFavoriteUpdates;
        if (data.notifyQueueUpdates !== undefined) updates.notify_queue_updates = data.notifyQueueUpdates;
        if (data.notifyDealAlerts !== undefined) updates.notify_deal_alerts = data.notifyDealAlerts;
        if (data.notifyAccountChanges !== undefined) updates.notify_account_changes = data.notifyAccountChanges;
        if (data.notifyMarketing !== undefined) updates.notify_marketing = data.notifyMarketing;

        updates.updated_at = new Date().toISOString();

        const { data: updated, error } = await supabase
            .from('notification_preferences')
            .upsert({ user_id: userId, ...updates })
            .select()
            .single();

        if (error) throw error;
        return this.mapToPreferences(updated);
    }

    async createDefaultPreferences(userId: string, client?: unknown): Promise<NotificationPreferences> {
        return this.updatePreferences(userId, {
            emailNotifications: true,
            pushNotifications: true,
            notifyNewReviews: true,
            notifyReviewReplies: true,
            notifyFavoriteUpdates: true,
            notifyQueueUpdates: true,
            notifyDealAlerts: true,
            notifyAccountChanges: true,
            notifyMarketing: false
        }, client);
    }

    private mapToNotification(row: any): Notification {
        return {
            id: row.id,
            userId: row.user_id,
            type: row.type,
            title: row.title,
            message: row.message,
            data: row.data || {},
            isRead: row.is_read,
            readAt: row.read_at, // may be undefined
            createdAt: row.created_at
        };
    }

    private mapToPreferences(row: any): NotificationPreferences {
        return {
            userId: row.user_id,
            emailNotifications: row.email_notifications,
            pushNotifications: row.push_notifications,
            notifyNewReviews: row.notify_new_reviews,
            notifyReviewReplies: row.notify_review_replies,
            notifyFavoriteUpdates: row.notify_favorite_updates,
            notifyQueueUpdates: row.notify_queue_updates,
            notifyDealAlerts: row.notify_deal_alerts,
            notifyAccountChanges: row.notify_account_changes,
            notifyMarketing: row.notify_marketing,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}

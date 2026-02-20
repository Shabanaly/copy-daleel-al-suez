import {
    Notification,
    NotificationPreferences,
    CreateNotificationDTO,
    UpdatePreferencesDTO
} from '../entities/notification';

export interface INotificationRepository {
    // Notifications
    create(data: CreateNotificationDTO, client?: unknown): Promise<Notification>;
    getUserNotifications(userId: string, limit?: number, offset?: number, client?: unknown): Promise<Notification[]>;
    getUnreadCount(userId: string, client?: unknown): Promise<number>;
    markAsRead(id: string, client?: unknown): Promise<void>;
    markAllAsRead(userId: string, client?: unknown): Promise<void>;
    delete(id: string, client?: unknown): Promise<void>;

    // Preferences
    getPreferences(userId: string, client?: unknown): Promise<NotificationPreferences | null>;
    updatePreferences(userId: string, data: UpdatePreferencesDTO, client?: unknown): Promise<NotificationPreferences>;
    createDefaultPreferences(userId: string, client?: unknown): Promise<NotificationPreferences>;
}

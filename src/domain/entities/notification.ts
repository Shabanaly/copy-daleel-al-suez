export type NotificationType =
    | 'general'
    | 'system_alert'
    | 'status_update'
    | 'marketplace_approve'
    | 'marketplace_reject'
    | 'marketplace_update'
    | 'lead_generation'
    | 'bump_alert'
    | 'review_reply'
    | 'queue_update'
    | 'deal_alert'
    | 'answer_accepted'
    | 'new_follower'
    | 'place_update'
    | 'system';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;

    isRead: boolean;
    readAt?: string;
    createdAt: string;
}

export interface NotificationPreferences {
    userId: string;

    // Channels
    emailNotifications: boolean;
    pushNotifications: boolean;

    // Types
    notifyNewReviews: boolean;
    notifyReviewReplies: boolean;
    notifyFavoriteUpdates: boolean;
    notifyQueueUpdates: boolean;
    notifyDealAlerts: boolean;
    notifyAccountChanges: boolean;
    notifyMarketing: boolean;

    createdAt: string;
    updatedAt: string;
}

export interface CreateNotificationDTO {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
}

export interface UpdatePreferencesDTO extends Partial<Omit<NotificationPreferences, 'userId' | 'createdAt' | 'updatedAt'>> { }

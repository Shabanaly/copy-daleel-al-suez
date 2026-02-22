export type NotificationType =
    | 'general'
    | 'system_alert'
    | 'status_update'
    | 'marketplace_approve'
    | 'marketplace_reject'
    | 'marketplace_update'
    | 'review_reply'
    | 'community_answer'
    | 'community_accept'
    | 'answer_accepted'
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

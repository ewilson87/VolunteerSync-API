/**
 * Notification channel types
 */
export type NotificationChannel = 'email' | 'in_app';

/**
 * Notification status types
 */
export type NotificationStatus = 'pending' | 'sent' | 'failed';

/**
 * Interface representing a notification in the system.
 */
export interface Notification {
    notificationId: number;
    userId: number;
    channel: NotificationChannel;
    subject: string;
    body: string;
    relatedEventId?: number | null;
    scheduledAt?: Date | null;
    sentAt?: Date | null;
    status: NotificationStatus;
}


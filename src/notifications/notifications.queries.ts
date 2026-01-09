export const notificationQueries = {
    /**
     * Get all notifications (admin only, typically filtered)
     */
    readNotifications: `
        SELECT
            notification_id AS notificationId,
            user_id AS userId,
            channel,
            subject,
            body,
            related_event_id AS relatedEventId,
            scheduled_at AS scheduledAt,
            sent_at AS sentAt,
            status
        FROM volunteersync.notifications
        ORDER BY scheduled_at DESC, created_at DESC
    `,

    /**
     * Get a specific notification by ID
     */
    readNotificationById: `
        SELECT
            notification_id AS notificationId,
            user_id AS userId,
            channel,
            subject,
            body,
            related_event_id AS relatedEventId,
            scheduled_at AS scheduledAt,
            sent_at AS sentAt,
            status
        FROM volunteersync.notifications
        WHERE notification_id = ?
    `,

    /**
     * Get all notifications for a specific user
     */
    readNotificationsByUserId: `
        SELECT
            notification_id AS notificationId,
            user_id AS userId,
            channel,
            subject,
            body,
            related_event_id AS relatedEventId,
            scheduled_at AS scheduledAt,
            sent_at AS sentAt,
            status
        FROM volunteersync.notifications
        WHERE user_id = ?
        ORDER BY scheduled_at DESC, sent_at DESC
    `,

    /**
     * Get notifications by status
     */
    readNotificationsByStatus: `
        SELECT
            notification_id AS notificationId,
            user_id AS userId,
            channel,
            subject,
            body,
            related_event_id AS relatedEventId,
            scheduled_at AS scheduledAt,
            sent_at AS sentAt,
            status
        FROM volunteersync.notifications
        WHERE status = ?
        ORDER BY scheduled_at ASC
    `,

    /**
     * Get notifications for a specific event
     */
    readNotificationsByEventId: `
        SELECT
            notification_id AS notificationId,
            user_id AS userId,
            channel,
            subject,
            body,
            related_event_id AS relatedEventId,
            scheduled_at AS scheduledAt,
            sent_at AS sentAt,
            status
        FROM volunteersync.notifications
        WHERE related_event_id = ?
        ORDER BY scheduled_at DESC
    `,

    /**
     * Get pending notifications that are ready to be sent (scheduled_at <= NOW() or NULL)
     */
    readPendingNotifications: `
        SELECT
            notification_id AS notificationId,
            user_id AS userId,
            channel,
            subject,
            body,
            related_event_id AS relatedEventId,
            scheduled_at AS scheduledAt,
            sent_at AS sentAt,
            status
        FROM volunteersync.notifications
        WHERE status = 'pending'
            AND (scheduled_at IS NULL OR scheduled_at <= NOW())
        ORDER BY scheduled_at ASC
    `,

    /**
     * Create a new notification
     */
    createNotification: `
        INSERT INTO volunteersync.notifications 
            (user_id, channel, subject, body, related_event_id, scheduled_at, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `,

    /**
     * Update an existing notification
     */
    updateNotification: `
        UPDATE volunteersync.notifications
        SET user_id = ?,
            channel = ?,
            subject = ?,
            body = ?,
            related_event_id = ?,
            scheduled_at = ?,
            sent_at = ?,
            status = ?
        WHERE notification_id = ?
    `,

    /**
     * Update notification status (for marking as sent/failed)
     */
    updateNotificationStatus: `
        UPDATE volunteersync.notifications
        SET status = ?,
            sent_at = ?
        WHERE notification_id = ?
    `,

    /**
     * Delete a notification
     */
    deleteNotification: `
        DELETE FROM volunteersync.notifications
        WHERE notification_id = ?
    `,

    /**
     * Delete all notifications for a user
     */
    deleteAllByUserId: `
        DELETE FROM volunteersync.notifications
        WHERE user_id = ?
    `
};


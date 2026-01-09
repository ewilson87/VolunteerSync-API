import { OkPacket } from 'mysql';
import { execute } from '../services/mysql.connector';
import { Notification, NotificationStatus } from './notifications.model';
import { notificationQueries } from './notifications.queries';

/**
 * Retrieves all notifications from the database.
 * @returns {Promise<Notification[]>} Array of all notification objects
 */
export const readNotifications = async () => {
    return execute<Notification[]>(notificationQueries.readNotifications, []);
};

/**
 * Retrieves a specific notification by its ID.
 * @param {number} notificationId - The unique identifier of the notification
 * @returns {Promise<Notification[]>} Array containing the notification object (or empty array if not found)
 */
export const readNotificationById = async (notificationId: number) => {
    return execute<Notification[]>(notificationQueries.readNotificationById, [notificationId]);
};

/**
 * Retrieves all notifications for a specific user.
 * @param {number} userId - The unique identifier of the user
 * @returns {Promise<Notification[]>} Array of notifications for the user
 */
export const readNotificationsByUserId = async (userId: number) => {
    return execute<Notification[]>(notificationQueries.readNotificationsByUserId, [userId]);
};

/**
 * Retrieves notifications by status.
 * @param {NotificationStatus} status - The status to filter by
 * @returns {Promise<Notification[]>} Array of notifications with the specified status
 */
export const readNotificationsByStatus = async (status: NotificationStatus) => {
    return execute<Notification[]>(notificationQueries.readNotificationsByStatus, [status]);
};

/**
 * Retrieves notifications for a specific event.
 * @param {number} eventId - The unique identifier of the event
 * @returns {Promise<Notification[]>} Array of notifications for the event
 */
export const readNotificationsByEventId = async (eventId: number) => {
    return execute<Notification[]>(notificationQueries.readNotificationsByEventId, [eventId]);
};

/**
 * Retrieves pending notifications that are ready to be sent.
 * @returns {Promise<Notification[]>} Array of pending notifications ready to send
 */
export const readPendingNotifications = async () => {
    return execute<Notification[]>(notificationQueries.readPendingNotifications, []);
};

/**
 * Creates a new notification in the database.
 * @param {Notification} notification - Notification object containing all required fields
 * @returns {Promise<OkPacket>} MySQL result packet with insertId
 */
export const createNotification = async (notification: Notification) => {
    return execute<OkPacket>(notificationQueries.createNotification, [
        notification.userId,
        notification.channel,
        notification.subject,
        notification.body,
        notification.relatedEventId || null,
        notification.scheduledAt || null,
        notification.status || 'pending'
    ]);
};

/**
 * Updates an existing notification.
 * @param {Notification} notification - Notification object with updated fields (must include notificationId)
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const updateNotification = async (notification: Notification) => {
    return execute<OkPacket>(notificationQueries.updateNotification, [
        notification.userId,
        notification.channel,
        notification.subject,
        notification.body,
        notification.relatedEventId || null,
        notification.scheduledAt || null,
        notification.sentAt || null,
        notification.status,
        notification.notificationId
    ]);
};

/**
 * Updates a notification's status (typically used when sending notifications).
 * @param {number} notificationId - The unique identifier of the notification
 * @param {NotificationStatus} status - The new status
 * @param {Date | null} sentAt - The timestamp when the notification was sent (null if not sent)
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const updateNotificationStatus = async (notificationId: number, status: NotificationStatus, sentAt: Date | null) => {
    return execute<OkPacket>(notificationQueries.updateNotificationStatus, [status, sentAt, notificationId]);
};

/**
 * Deletes a notification from the database.
 * @param {number} notificationId - The unique identifier of the notification to delete
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteNotification = async (notificationId: number) => {
    return execute<OkPacket>(notificationQueries.deleteNotification, [notificationId]);
};

/**
 * Deletes all notifications for a user.
 * @param {number} userId - The unique identifier of the user
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteAllByUserId = async (userId: number) => {
    return execute<OkPacket>(notificationQueries.deleteAllByUserId, [userId]);
};


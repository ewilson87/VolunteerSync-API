import { Request, RequestHandler, Response } from 'express';
import { OkPacket } from 'mysql';
import * as NotificationsDao from './notifications.dao';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Notification, NotificationStatus } from './notifications.model';
import logger from '../services/logger.service';
import { processPendingEmailNotifications } from '../services/notification-processor.service';
import { generateEventReminders } from '../jobs/eventReminder.job';

/**
 * Retrieves all notifications (admin only).
 * 
 * @route GET /notifications
 * @access Private (Admin only)
 * @returns {Promise<void>} JSON array of all notifications
 */
export const readNotifications: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;

        if (!authenticatedUser || authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to read all notifications', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators can view all notifications'
            });
            return;
        }

        const notifications = await NotificationsDao.readNotifications();
        logger.info('Retrieved all notifications', { requestId, count: notifications.length });
        res.status(200).json(notifications);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching notifications', {
            requestId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching notifications'
        });
    }
};

/**
 * Retrieves a specific notification by ID.
 * Users can only view their own notifications unless they're admin.
 * 
 * @route GET /notifications/:notificationId
 * @access Private
 * @param {number} req.params.notificationId - The ID of the notification to retrieve
 * @returns {Promise<void>} JSON object containing notification data
 */
export const readNotificationById: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const notificationId = parseInt(req.params.notificationId);
        const authenticatedUser = req.user;

        if (!authenticatedUser) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        const notification = await NotificationsDao.readNotificationById(notificationId);

        if (!notification || notification.length === 0) {
            res.status(404).json({
                message: 'Notification not found'
            });
            return;
        }

        const notificationData = notification[0];

        // Users can only view their own notifications unless they're admin
        if (authenticatedUser.role !== 'admin' && notificationData.userId !== authenticatedUser.userId) {
            logger.warn('Unauthorized attempt to view notification', {
                requestId,
                notificationId,
                requestedUserId: notificationData.userId,
                authenticatedUserId: authenticatedUser.userId
            });
            res.status(403).json({
                message: 'You can only view your own notifications'
            });
            return;
        }

        logger.info('Retrieved notification by ID', { requestId, notificationId });
        res.status(200).json(notificationData);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching notification by ID', {
            requestId,
            notificationId: req.params.notificationId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the notification'
        });
    }
};

/**
 * Retrieves all notifications for the authenticated user.
 * 
 * @route GET /notifications/user/:userId
 * @access Private (User can only see their own notifications, or Admin can see any)
 * @param {number} req.params.userId - The ID of the user
 * @returns {Promise<void>} JSON array of notifications for the user
 */
export const readNotificationsByUserId: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const userId = parseInt(req.params.userId);
        const authenticatedUser = req.user;

        if (!authenticatedUser) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        // Users can only view their own notifications unless they're admin
        if (authenticatedUser.role !== 'admin' && authenticatedUser.userId !== userId) {
            logger.warn('Unauthorized attempt to view user notifications', {
                requestId,
                requestedUserId: userId,
                authenticatedUserId: authenticatedUser.userId,
                role: authenticatedUser.role
            });
            res.status(403).json({
                message: 'You can only view your own notifications'
            });
            return;
        }

        const notifications = await NotificationsDao.readNotificationsByUserId(userId);
        logger.info('Retrieved notifications for user', { requestId, userId, count: notifications.length });
        res.status(200).json(notifications);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching notifications for user', {
            requestId,
            userId: req.params.userId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the notifications'
        });
    }
};

/**
 * Retrieves notifications by status (admin only).
 * 
 * @route GET /notifications/status/:status
 * @access Private (Admin only)
 * @param {string} req.params.status - The status to filter by (pending, sent, failed)
 * @returns {Promise<void>} JSON array of notifications with the specified status
 */
export const readNotificationsByStatus: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const status = req.params.status as NotificationStatus;

        if (!authenticatedUser || authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to read notifications by status', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators can filter notifications by status'
            });
            return;
        }

        if (!['pending', 'sent', 'failed'].includes(status)) {
            res.status(400).json({
                message: 'Invalid status. Must be pending, sent, or failed'
            });
            return;
        }

        const notifications = await NotificationsDao.readNotificationsByStatus(status);
        logger.info('Retrieved notifications by status', { requestId, status, count: notifications.length });
        res.status(200).json(notifications);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching notifications by status', {
            requestId,
            status: req.params.status,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the notifications'
        });
    }
};

/**
 * Retrieves pending notifications ready to be sent (admin/system only).
 * 
 * @route GET /notifications/pending
 * @access Private (Admin only)
 * @returns {Promise<void>} JSON array of pending notifications ready to send
 */
export const readPendingNotifications: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;

        if (!authenticatedUser || authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to read pending notifications', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators can view pending notifications'
            });
            return;
        }

        const notifications = await NotificationsDao.readPendingNotifications();
        logger.info('Retrieved pending notifications', { requestId, count: notifications.length });
        res.status(200).json(notifications);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching pending notifications', {
            requestId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching pending notifications'
        });
    }
};

/**
 * Creates a new notification.
 * 
 * @route POST /notifications
 * @access Private (Admin or Organizer)
 * @param {Object} req.body - Notification data
 * @returns {Promise<void>} JSON object with creation result
 */
export const createNotification: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const notificationData: Notification = req.body;

        if (!authenticatedUser || (authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'organizer')) {
            logger.warn('Unauthorized attempt to create notification', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators and organizers can create notifications'
            });
            return;
        }

        const okPacket: OkPacket = await NotificationsDao.createNotification(notificationData);
        logger.info('Notification created', {
            requestId,
            notificationId: okPacket.insertId,
            userId: notificationData.userId,
            createdBy: authenticatedUser.userId
        });
        res.status(201).json({
            ...okPacket,
            notificationId: okPacket.insertId
        });
    } catch (error: any) {
        const requestId = (req as any).requestId;
        logger.error('Error creating notification', {
            requestId,
            notificationData: req.body,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error creating the notification'
        });
    }
};

/**
 * Updates an existing notification.
 * 
 * @route PUT /notifications
 * @access Private (Admin only)
 * @param {number} req.body.notificationId - The ID of the notification to update
 * @param {Object} req.body - Updated notification data
 * @returns {Promise<void>} JSON object with update result
 */
export const updateNotification: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const notificationData: Notification = req.body;

        if (!authenticatedUser || authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to update notification', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators can update notifications'
            });
            return;
        }

        const okPacket: OkPacket = await NotificationsDao.updateNotification(notificationData);
        
        if (okPacket.affectedRows === 0) {
            res.status(404).json({
                message: 'Notification not found'
            });
            return;
        }

        logger.info('Notification updated', {
            requestId,
            notificationId: notificationData.notificationId,
            userId: authenticatedUser.userId
        });
        res.status(200).json(okPacket);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error updating notification', {
            requestId,
            notificationData: req.body,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error updating the notification'
        });
    }
};

/**
 * Updates a notification's status (typically used when sending notifications).
 * 
 * @route PUT /notifications/:notificationId/status
 * @access Private (Admin only)
 * @param {number} req.params.notificationId - The ID of the notification
 * @param {string} req.body.status - The new status (pending, sent, failed)
 * @param {Date} [req.body.sentAt] - Optional timestamp when notification was sent
 * @returns {Promise<void>} JSON object with update result
 */
export const updateNotificationStatus: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const notificationId = parseInt(req.params.notificationId);
        const { status, sentAt } = req.body;

        if (!authenticatedUser || authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to update notification status', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators can update notification status'
            });
            return;
        }

        if (!['pending', 'sent', 'failed'].includes(status)) {
            res.status(400).json({
                message: 'Invalid status. Must be pending, sent, or failed'
            });
            return;
        }

        const sentAtDate = sentAt ? new Date(sentAt) : (status === 'sent' ? new Date() : null);
        const okPacket: OkPacket = await NotificationsDao.updateNotificationStatus(notificationId, status, sentAtDate);
        
        if (okPacket.affectedRows === 0) {
            res.status(404).json({
                message: 'Notification not found'
            });
            return;
        }

        logger.info('Notification status updated', {
            requestId,
            notificationId,
            status,
            userId: authenticatedUser.userId
        });
        res.status(200).json(okPacket);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error updating notification status', {
            requestId,
            notificationId: req.params.notificationId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error updating the notification status'
        });
    }
};

/**
 * Deletes a notification from the database.
 * 
 * @route DELETE /notifications/:notificationId
 * @access Private (Admin only, or user can delete their own)
 * @param {number} req.params.notificationId - The ID of the notification to delete
 * @returns {Promise<void>} JSON object with deletion result
 */
export const deleteNotification: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const notificationId = parseInt(req.params.notificationId);

        if (!authenticatedUser) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        // Check if notification exists and belongs to user (unless admin)
        const notification = await NotificationsDao.readNotificationById(notificationId);
        if (!notification || notification.length === 0) {
            res.status(404).json({
                message: 'Notification not found'
            });
            return;
        }

        // Users can only delete their own notifications unless they're admin
        if (authenticatedUser.role !== 'admin' && notification[0].userId !== authenticatedUser.userId) {
            logger.warn('Unauthorized attempt to delete notification', {
                requestId,
                notificationId,
                notificationUserId: notification[0].userId,
                authenticatedUserId: authenticatedUser.userId
            });
            res.status(403).json({
                message: 'You can only delete your own notifications'
            });
            return;
        }

        const response = await NotificationsDao.deleteNotification(notificationId);
        logger.info('Notification deleted', { requestId, notificationId, userId: authenticatedUser.userId });
        res.status(200).json(response);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error deleting notification', {
            requestId,
            notificationId: req.params.notificationId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error deleting the notification'
        });
    }
};

/**
 * Processes and sends all pending email notifications.
 * 
 * @route POST /notifications/process-pending
 * @access Private (Admin only)
 * @returns {Promise<void>} JSON object with processing results
 */
export const processPendingNotifications: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;

        if (!authenticatedUser || authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to process pending notifications', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators can process pending notifications'
            });
            return;
        }

        const result = await processPendingEmailNotifications();
        
        logger.info('Pending notifications processed', {
            requestId,
            processedBy: authenticatedUser.userId,
            ...result
        });

        res.status(200).json({
            message: 'Pending email notifications processed',
            ...result
        });
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error processing pending notifications', {
            requestId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error processing pending notifications'
        });
    }
};

/**
 * Generates event reminder notifications by finding signups for upcoming events.
 * This creates notification records in the database, which can then be sent via process-pending.
 * 
 * @route POST /notifications/generate-reminders
 * @access Private (Admin only)
 * @returns {Promise<void>} JSON object with generation results
 */
export const generateReminders: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;

        if (!authenticatedUser || authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to generate reminders', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators can generate reminder notifications'
            });
            return;
        }

        logger.info('Manual reminder generation triggered', {
            requestId,
            triggeredBy: authenticatedUser.userId
        });

        await generateEventReminders();
        
        res.status(200).json({
            message: 'Event reminder notifications generated. Check logs for details. Use /notifications/process-pending to send them.'
        });
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error generating reminder notifications', {
            requestId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error generating reminder notifications'
        });
    }
};


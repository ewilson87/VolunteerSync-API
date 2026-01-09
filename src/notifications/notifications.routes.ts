import { Router } from 'express';
import * as NotificationsController from './notifications.controller';
import { authenticateToken, requireAdmin, requireOrganizerOrAdmin } from '../middleware/auth.middleware';
import { param, body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const notificationIdParam = param('notificationId')
    .isInt({ min: 1 })
    .withMessage('Notification ID must be a positive integer');

const userIdParam = param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer');

const statusParam = param('status')
    .isIn(['pending', 'sent', 'failed'])
    .withMessage('Status must be pending, sent, or failed');

const channelBody = body('channel')
    .isIn(['email', 'in_app'])
    .withMessage('Channel must be email or in_app');

const statusBody = body('status')
    .optional()
    .isIn(['pending', 'sent', 'failed'])
    .withMessage('Status must be pending, sent, or failed');

const subjectBody = body('subject')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Subject must be between 1 and 150 characters')
    .escape();

const bodyBody = body('body')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Body is required and cannot be empty')
    .escape();

const userIdBody = body('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer');

const notificationIdBody = body('notificationId')
    .isInt({ min: 1 })
    .withMessage('Notification ID must be a positive integer');

const relatedEventIdBody = body('relatedEventId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Related event ID must be a positive integer');

const scheduledAtBody = body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Scheduled at must be a valid ISO 8601 date')
    .toDate();

const sentAtBody = body('sentAt')
    .optional()
    .isISO8601()
    .withMessage('Sent at must be a valid ISO 8601 date')
    .toDate();

// Protected routes
// GET /notifications - Get all notifications (Admin only)
router
    .route('/notifications')
    .get(authenticateToken, requireAdmin, NotificationsController.readNotifications);

// GET /notifications/pending - Get pending notifications ready to send (Admin only)
router
    .route('/notifications/pending')
    .get(authenticateToken, requireAdmin, NotificationsController.readPendingNotifications);

// POST /notifications/generate-reminders - Generate event reminder notifications (Admin only)
router
    .route('/notifications/generate-reminders')
    .post(authenticateToken, requireAdmin, NotificationsController.generateReminders);

// POST /notifications/process-pending - Process and send all pending email notifications (Admin only)
router
    .route('/notifications/process-pending')
    .post(authenticateToken, requireAdmin, NotificationsController.processPendingNotifications);

// GET /notifications/status/:status - Get notifications by status (Admin only)
router
    .route('/notifications/status/:status')
    .get(authenticateToken, requireAdmin, statusParam, validate, NotificationsController.readNotificationsByStatus);

// GET /notifications/user/:userId - Get all notifications for a user
router
    .route('/notifications/user/:userId')
    .get(authenticateToken, userIdParam, validate, NotificationsController.readNotificationsByUserId);

// GET /notifications/:notificationId - Get a specific notification by ID
router
    .route('/notifications/:notificationId')
    .get(authenticateToken, notificationIdParam, validate, NotificationsController.readNotificationById);

// POST /notifications - Create a new notification (Admin or Organizer)
router
    .route('/notifications')
    .post(authenticateToken, requireOrganizerOrAdmin, userIdBody, channelBody, subjectBody, bodyBody, relatedEventIdBody, scheduledAtBody, statusBody, validate, NotificationsController.createNotification);

// PUT /notifications - Update an existing notification (Admin only)
router
    .route('/notifications')
    .put(authenticateToken, requireAdmin, notificationIdBody, userIdBody, channelBody, subjectBody, bodyBody, relatedEventIdBody, scheduledAtBody, sentAtBody, statusBody, validate, NotificationsController.updateNotification);

// PUT /notifications/:notificationId/status - Update notification status (Admin only)
router
    .route('/notifications/:notificationId/status')
    .put(authenticateToken, requireAdmin, notificationIdParam, statusBody, sentAtBody, validate, NotificationsController.updateNotificationStatus);

// DELETE /notifications/:notificationId - Delete a notification (Admin or user can delete their own)
router
    .route('/notifications/:notificationId')
    .delete(authenticateToken, notificationIdParam, validate, NotificationsController.deleteNotification);

export default router;


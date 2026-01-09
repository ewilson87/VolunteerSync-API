import * as NotificationsDao from '../notifications/notifications.dao';
import * as UsersDao from '../users/users.dao';
import { Notification } from '../notifications/notifications.model';
import { sendEmail } from './email.service';
import logger from './logger.service';

/**
 * Processes and sends pending email notifications.
 * This function:
 * 1. Retrieves all pending email notifications that are ready to be sent
 * 2. Fetches user email addresses
 * 3. Sends the emails via Ethereal
 * 4. Updates notification status to 'sent' or 'failed'
 * 
 * @returns {Promise<{ sent: number; failed: number; total: number }>} Summary of processing results
 */
export async function processPendingEmailNotifications(): Promise<{
    sent: number;
    failed: number;
    total: number;
}> {
    let sent = 0;
    let failed = 0;

    try {
        // Get all pending email notifications that are ready to send
        const pendingNotifications = await NotificationsDao.readPendingNotifications();
        
        // Filter to only email notifications
        const pendingEmailNotifications = pendingNotifications.filter(
            notification => notification.channel === 'email'
        );

        logger.info('Processing pending email notifications', {
            total: pendingEmailNotifications.length
        });

        // Process each notification
        for (const notification of pendingEmailNotifications) {
            try {
                // Get user email address
                const users = await UsersDao.readUserById(notification.userId);
                
                if (!users || users.length === 0) {
                    logger.warn('User not found for notification', {
                        notificationId: notification.notificationId,
                        userId: notification.userId
                    });
                    await NotificationsDao.updateNotificationStatus(
                        notification.notificationId,
                        'failed',
                        null
                    );
                    failed++;
                    continue;
                }

                const user = users[0];
                const userEmail = user.email;

                if (!userEmail) {
                    logger.warn('User has no email address', {
                        notificationId: notification.notificationId,
                        userId: notification.userId
                    });
                    await NotificationsDao.updateNotificationStatus(
                        notification.notificationId,
                        'failed',
                        null
                    );
                    failed++;
                    continue;
                }

                // Send the email
                await sendEmail({
                    to: userEmail,
                    subject: notification.subject,
                    text: notification.body
                });

                // Update notification status to 'sent'
                await NotificationsDao.updateNotificationStatus(
                    notification.notificationId,
                    'sent',
                    new Date()
                );

                logger.info('Email notification sent successfully', {
                    notificationId: notification.notificationId,
                    userId: notification.userId,
                    email: userEmail
                });

                sent++;
            } catch (error) {
                logger.error('Error processing email notification', {
                    notificationId: notification.notificationId,
                    userId: notification.userId,
                    error: error instanceof Error ? {
                        message: error.message,
                        stack: error.stack
                    } : error
                });

                // Update notification status to 'failed'
                try {
                    await NotificationsDao.updateNotificationStatus(
                        notification.notificationId,
                        'failed',
                        null
                    );
                } catch (updateError) {
                    logger.error('Error updating notification status to failed', {
                        notificationId: notification.notificationId,
                        error: updateError instanceof Error ? {
                            message: updateError.message,
                            stack: updateError.stack
                        } : updateError
                    });
                }

                failed++;
            }
        }

        const total = sent + failed;
        logger.info('Finished processing email notifications', {
            sent,
            failed,
            total
        });

        return { sent, failed, total };
    } catch (error) {
        logger.error('Error processing pending email notifications', {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        throw error;
    }
}

/**
 * Sends a single email notification immediately.
 * This is useful when creating a notification that should be sent right away.
 * 
 * @param {Notification} notification - The notification to send
 * @returns {Promise<boolean>} True if sent successfully, false otherwise
 */
export async function sendEmailNotification(notification: Notification): Promise<boolean> {
    try {
        // Only process email notifications
        if (notification.channel !== 'email') {
            logger.warn('Attempted to send non-email notification via email service', {
                notificationId: notification.notificationId,
                channel: notification.channel
            });
            return false;
        }

        // Get user email address
        const users = await UsersDao.readUserById(notification.userId);
        
        if (!users || users.length === 0) {
            logger.warn('User not found for notification', {
                notificationId: notification.notificationId,
                userId: notification.userId
            });
            return false;
        }

        const user = users[0];
        const userEmail = user.email;

        if (!userEmail) {
            logger.warn('User has no email address', {
                notificationId: notification.notificationId,
                userId: notification.userId
            });
            return false;
        }

        // Send the email
        await sendEmail({
            to: userEmail,
            subject: notification.subject,
            text: notification.body
        });

        logger.info('Email notification sent successfully', {
            notificationId: notification.notificationId,
            userId: notification.userId,
            email: userEmail
        });

        return true;
    } catch (error) {
        logger.error('Error sending email notification', {
            notificationId: notification.notificationId,
            userId: notification.userId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        return false;
    }
}



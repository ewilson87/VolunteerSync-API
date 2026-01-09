import cron from 'node-cron';
import { execute } from '../services/mysql.connector';
import * as NotificationsDao from '../notifications/notifications.dao';
import logger from '../services/logger.service';
import { processPendingEmailNotifications } from '../services/notification-processor.service';

/**
 * Interface for signup with event details
 */
interface SignupWithEvent {
    signupId: number;
    userId: number;
    eventId: number;
    eventTitle: string;
    eventDate: Date;
    eventTime: string;
    locationName: string;
    address: string;
    city: string;
    state: string;
    reminderType: '7day' | '24hour';
}

/**
 * Finds signups for events happening in approximately 7 days (±2 hours).
 * Uses a 4-hour window (2 hours before and 2 hours after 7 days from now) to catch events.
 * @returns {Promise<SignupWithEvent[]>} Array of signups with event details
 */
async function findSignupsFor7DayReminder(): Promise<SignupWithEvent[]> {
    // Get the target time range for debugging
    const targetTimeQuery = `
        SELECT 
            DATE_SUB(NOW() + INTERVAL 7 DAY, INTERVAL 2 HOUR) AS windowStart,
            DATE_ADD(NOW() + INTERVAL 7 DAY, INTERVAL 2 HOUR) AS windowEnd,
            NOW() + INTERVAL 7 DAY AS targetTime,
            NOW() AS currentTime
    `;
    const timeInfo = await execute<Array<{ windowStart: Date; windowEnd: Date; targetTime: Date; currentTime: Date }>>(targetTimeQuery, []);
    
    if (timeInfo && timeInfo.length > 0) {
        logger.debug('7-day reminder search window', {
            currentTime: timeInfo[0].currentTime,
            targetTime: timeInfo[0].targetTime,
            windowStart: timeInfo[0].windowStart,
            windowEnd: timeInfo[0].windowEnd
        });
    }

    const query = `
        SELECT 
            s.signup_id AS signupId,
            s.user_id AS userId,
            s.event_id AS eventId,
            e.title AS eventTitle,
            e.event_date AS eventDate,
            e.event_time AS eventTime,
            e.location_name AS locationName,
            e.address AS address,
            e.city AS city,
            e.state AS state,
            TIMESTAMP(e.event_date, e.event_time) AS eventDateTime
        FROM volunteersync.signups s
        INNER JOIN volunteersync.events e ON s.event_id = e.event_id
        WHERE s.status = 'registered'
            AND TIMESTAMP(e.event_date, e.event_time) >= DATE_SUB(NOW() + INTERVAL 7 DAY, INTERVAL 2 HOUR)
            AND TIMESTAMP(e.event_date, e.event_time) <= DATE_ADD(NOW() + INTERVAL 7 DAY, INTERVAL 2 HOUR)
    `;
    
    const results = await execute<SignupWithEvent[]>(query, []);
    
    if (results.length > 0) {
        logger.info('Found signups for 7-day reminders with details', {
            count: results.length,
            events: results.map(r => ({
                eventId: r.eventId,
                eventTitle: r.eventTitle,
                eventDate: r.eventDate,
                eventTime: r.eventTime,
                eventDateTime: (r as any).eventDateTime
            }))
        });
    }
    
    return results.map(row => ({
        ...row,
        reminderType: '7day' as const
    }));
}

/**
 * Finds signups for events happening in approximately 24 hours (±2 hours).
 * Uses a 4-hour window (2 hours before and 2 hours after 24 hours from now) to catch events.
 * @returns {Promise<SignupWithEvent[]>} Array of signups with event details
 */
async function findSignupsFor24HourReminder(): Promise<SignupWithEvent[]> {
    // Get the target time range for debugging
    const targetTimeQuery = `
        SELECT 
            DATE_SUB(NOW() + INTERVAL 1 DAY, INTERVAL 2 HOUR) AS windowStart,
            DATE_ADD(NOW() + INTERVAL 1 DAY, INTERVAL 2 HOUR) AS windowEnd,
            NOW() + INTERVAL 1 DAY AS targetTime,
            NOW() AS currentTime
    `;
    const timeInfo = await execute<Array<{ windowStart: Date; windowEnd: Date; targetTime: Date; currentTime: Date }>>(targetTimeQuery, []);
    
    if (timeInfo && timeInfo.length > 0) {
        logger.debug('24-hour reminder search window', {
            currentTime: timeInfo[0].currentTime,
            targetTime: timeInfo[0].targetTime,
            windowStart: timeInfo[0].windowStart,
            windowEnd: timeInfo[0].windowEnd
        });
    }

    const query = `
        SELECT 
            s.signup_id AS signupId,
            s.user_id AS userId,
            s.event_id AS eventId,
            e.title AS eventTitle,
            e.event_date AS eventDate,
            e.event_time AS eventTime,
            e.location_name AS locationName,
            e.address AS address,
            e.city AS city,
            e.state AS state,
            TIMESTAMP(e.event_date, e.event_time) AS eventDateTime
        FROM volunteersync.signups s
        INNER JOIN volunteersync.events e ON s.event_id = e.event_id
        WHERE s.status = 'registered'
            AND TIMESTAMP(e.event_date, e.event_time) >= DATE_SUB(NOW() + INTERVAL 1 DAY, INTERVAL 2 HOUR)
            AND TIMESTAMP(e.event_date, e.event_time) <= DATE_ADD(NOW() + INTERVAL 1 DAY, INTERVAL 2 HOUR)
    `;
    
    const results = await execute<SignupWithEvent[]>(query, []);
    
    if (results.length > 0) {
        logger.info('Found signups for 24-hour reminders with details', {
            count: results.length,
            events: results.map(r => ({
                eventId: r.eventId,
                eventTitle: r.eventTitle,
                eventDate: r.eventDate,
                eventTime: r.eventTime,
                eventDateTime: (r as any).eventDateTime
            }))
        });
    }
    
    return results.map(row => ({
        ...row,
        reminderType: '24hour' as const
    }));
}

/**
 * Checks if a notification already exists for a user+event+reminder type combination.
 * We check by looking for notifications with the same user_id, related_event_id, 
 * and a subject that contains the reminder type indicator.
 * 
 * @param {number} userId - User ID
 * @param {number} eventId - Event ID
 * @param {'7day' | '24hour'} reminderType - Type of reminder
 * @returns {Promise<boolean>} True if notification exists, false otherwise
 */
async function notificationExists(
    userId: number,
    eventId: number,
    reminderType: '7day' | '24hour'
): Promise<boolean> {
    // Check for existing notification with same user, event, and reminder type indicator
    const indicator = reminderType === '7day' ? '7 days' : '24 hours';
    const query = `
        SELECT COUNT(*) AS count
        FROM volunteersync.notifications
        WHERE user_id = ?
            AND related_event_id = ?
            AND channel = 'email'
            AND (subject LIKE ? OR body LIKE ?)
    `;
    
    const results = await execute<{ count: number }[]>(query, [
        userId,
        eventId,
        `%${indicator}%`,
        `%${indicator}%`
    ]);
    
    return results[0]?.count > 0;
}

/**
 * Formats event date and time for display
 */
function formatEventDateTime(eventDate: Date, eventTime: string): string {
    const date = new Date(eventDate);
    const [hours, minutes] = eventTime.split(':');
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    
    return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Creates email notification for an event reminder
 */
async function createReminderNotification(signup: SignupWithEvent): Promise<void> {
    const eventDateTime = formatEventDateTime(signup.eventDate, signup.eventTime);
    const daysText = signup.reminderType === '7day' ? '7 days' : '24 hours';
    
    const subject = `Event Reminder: ${signup.eventTitle} (in ${daysText})`;
    const body = `Hello!

This is a reminder that you have signed up for the following volunteer event:

Event: ${signup.eventTitle}
Date & Time: ${eventDateTime}
Location: ${signup.locationName}
Address: ${signup.address}
${signup.city}, ${signup.state}

The event is coming up in ${daysText}. We look forward to seeing you there!

Thank you for volunteering with VolunteerSync!`;

    await NotificationsDao.createNotification({
        notificationId: 0, // Will be set by database
        userId: signup.userId,
        channel: 'email',
        subject: subject,
        body: body,
        relatedEventId: signup.eventId,
        scheduledAt: null, // Send immediately (will be processed by notification processor)
        sentAt: null,
        status: 'pending'
    });
}

/**
 * Processes reminders for a specific reminder type
 */
async function processReminders(signups: SignupWithEvent[], reminderType: string): Promise<{
    processed: number;
    skipped: number;
    errors: number;
}> {
    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const signup of signups) {
        try {
            // Check if notification already exists
            const exists = await notificationExists(
                signup.userId,
                signup.eventId,
                signup.reminderType
            );

            if (exists) {
                logger.debug('Notification already exists, skipping', {
                    userId: signup.userId,
                    eventId: signup.eventId,
                    reminderType: signup.reminderType
                });
                skipped++;
                continue;
            }

            // Create the notification
            await createReminderNotification(signup);
            processed++;

            logger.info('Event reminder notification created', {
                userId: signup.userId,
                eventId: signup.eventId,
                reminderType: signup.reminderType,
                eventTitle: signup.eventTitle
            });
        } catch (error) {
            errors++;
            logger.error('Error creating reminder notification', {
                userId: signup.userId,
                eventId: signup.eventId,
                reminderType: signup.reminderType,
                error: error instanceof Error ? {
                    message: error.message,
                    stack: error.stack
                } : error
            });
        }
    }

    return { processed, skipped, errors };
}

/**
 * Main function to generate event reminder notifications
 * Exported so it can be called manually via API endpoint
 */
export async function generateEventReminders(): Promise<void> {
    try {
        logger.info('Starting event reminder notification generation');

        // Find signups for 7-day reminders
        const signups7Day = await findSignupsFor7DayReminder();
        logger.info('Found signups for 7-day reminders', { 
            count: signups7Day.length,
            signupDetails: signups7Day.length > 0 ? signups7Day.map(s => ({
                signupId: s.signupId,
                userId: s.userId,
                eventId: s.eventId,
                eventTitle: s.eventTitle
            })) : []
        });

        // Find signups for 24-hour reminders
        const signups24Hour = await findSignupsFor24HourReminder();
        logger.info('Found signups for 24-hour reminders', { 
            count: signups24Hour.length,
            signupDetails: signups24Hour.length > 0 ? signups24Hour.map(s => ({
                signupId: s.signupId,
                userId: s.userId,
                eventId: s.eventId,
                eventTitle: s.eventTitle
            })) : []
        });

        // Process 7-day reminders
        const result7Day = await processReminders(signups7Day, '7day');
        logger.info('7-day reminder processing complete', result7Day);

        // Process 24-hour reminders
        const result24Hour = await processReminders(signups24Hour, '24hour');
        logger.info('24-hour reminder processing complete', result24Hour);

        const total = {
            processed: result7Day.processed + result24Hour.processed,
            skipped: result7Day.skipped + result24Hour.skipped,
            errors: result7Day.errors + result24Hour.errors
        };

        logger.info('Event reminder notification generation complete', total);

        // Automatically process and send the pending email notifications
        if (total.processed > 0) {
            logger.info('Processing pending email notifications');
            try {
                const emailResults = await processPendingEmailNotifications();
                logger.info('Email notifications processed and sent', emailResults);
            } catch (emailError) {
                logger.error('Error processing email notifications', {
                    error: emailError instanceof Error ? {
                        message: emailError.message,
                        stack: emailError.stack
                    } : emailError
                });
            }
        } else {
            logger.debug('No new notifications to send');
        }
    } catch (error) {
        logger.error('Error generating event reminder notifications', {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
    }
}

/**
 * Starts the scheduled job to generate event reminder notifications.
 * Runs every hour at the top of the hour.
 */
export const startEventReminderJob = () => {
    // Schedule job to run every hour at minute 0
    // Cron format: minute hour day month day-of-week
    // '0 * * * *' = At minute 0 of every hour
    cron.schedule('0 * * * *', async () => {
        await generateEventReminders();
    });

    logger.info('Event reminder job scheduled to run every hour at minute 0');
    
    // Also run immediately on startup (optional - comment out if you don't want this)
    // generateEventReminders().catch(error => {
    //     logger.error('Error running initial event reminder check', {
    //         error: error instanceof Error ? {
    //             message: error.message,
    //             stack: error.stack
    //         } : error
    //     });
    // });
};


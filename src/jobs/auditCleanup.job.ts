import cron from 'node-cron';
import { execute } from '../services/mysql.connector';
import logger, { auditLogger } from '../services/logger.service';

/**
 * Scheduled job to clean up old audit log entries.
 * Runs daily at 02:00 server time and deletes audit logs older than 90 days.
 * 
 * This job:
 * - Deletes audit_log entries older than 90 days
 * - Logs cleanup operations to both logger and auditLogger
 * - Never crashes the server if cleanup fails
 */
export const startAuditCleanupJob = () => {
    // Schedule job to run daily at 02:00 server time
    // Cron format: minute hour day month day-of-week
    // '0 2 * * *' = At 02:00 every day
    cron.schedule('0 2 * * *', async () => {
        try {
            logger.info('Starting audit log cleanup job');

            // Delete audit logs older than 90 days
            // Note: Using occurred_at as that's the actual column name in the audit_log table
            const deleteQuery = `
                DELETE FROM volunteersync.audit_log
                WHERE occurred_at < (NOW() - INTERVAL 90 DAY)
            `;

            const result = await execute<any>(deleteQuery, []);

            const deletedCount = result.affectedRows || 0;

            // Log to regular logger
            logger.info('Audit log cleanup completed', {
                deletedCount,
                retentionDays: 90
            });

            // Log to audit logger with system_cleanup action
            auditLogger.info('System Cleanup', {
                action: 'system_cleanup',
                entityType: 'audit_log',
                details: {
                    deletedCount,
                    retentionDays: 90,
                    cleanupType: 'scheduled_daily'
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            // Log error but don't crash the server
            logger.error('Audit log cleanup job failed', {
                error: error instanceof Error ? {
                    message: error.message,
                    stack: error.stack
                } : error
            });

            // Also log to audit logger
            auditLogger.error('System Cleanup Failed', {
                action: 'system_cleanup',
                entityType: 'audit_log',
                details: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    retentionDays: 90,
                    cleanupType: 'scheduled_daily'
                },
                timestamp: new Date().toISOString()
            });
        }
    });

    logger.info('Audit cleanup job scheduled to run daily at 02:00');
};


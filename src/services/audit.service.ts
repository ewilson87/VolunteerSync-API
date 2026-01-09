import { execute } from './mysql.connector';
import { auditLogger } from './logger.service';
import logger from './logger.service';

/**
 * Options for recording an audit event.
 */
export interface RecordAuditEventOptions {
    /** The user ID of the actor performing the action (optional for system actions) */
    userId?: number;
    /** The type of action being performed (e.g., 'create', 'update', 'delete', 'login', 'approve', 'reject') */
    actionType: string;
    /** The type of entity being acted upon (e.g., 'event', 'organization', 'user', 'auth', 'signup') */
    entityType: string;
    /** The ID of the entity being acted upon (optional) */
    entityId?: number;
    /** Additional details about the action as a JSON object (will be serialized) */
    details?: any;
    /** The IP address of the client making the request */
    ipAddress?: string;
}

/**
 * Records an audit event to both the database (audit_log table) and the audit log file.
 * 
 * This function is designed to never throw errors that would interrupt the main operation.
 * If the database insert fails, it will log an error with Winston but allow the main
 * operation to continue successfully.
 * 
 * **When to use:**
 * - After successful creation, update, or deletion of important entities
 * - After authentication events (login, logout)
 * - After authorization decisions (approvals, rejections)
 * - After security-relevant actions (unauthorized access attempts)
 * 
 * **What to include in details:**
 * - Key information about what changed (e.g., field names that were updated)
 * - Relevant context (e.g., event title, organization name)
 * - **Do NOT include:** passwords, JWT tokens, or other sensitive data
 * 
 * @param {RecordAuditEventOptions} options - The audit event options
 * @returns {Promise<void>} Resolves when the audit event is recorded (or silently fails)
 * 
 * @example
 * // Record event creation
 * await recordAuditEvent({
 *   userId: req.user?.userId,
 *   actionType: 'create',
 *   entityType: 'event',
 *   entityId: eventId,
 *   details: { title: eventData.title, organizationId: eventData.organizationId },
 *   ipAddress: req.ip
 * });
 * 
 * @example
 * // Record login
 * await recordAuditEvent({
 *   userId: user.userId,
 *   actionType: 'login',
 *   entityType: 'auth',
 *   details: { email: user.email, role: user.role },
 *   ipAddress: req.ip
 * });
 */
export const recordAuditEvent = async (options: RecordAuditEventOptions): Promise<void> => {
    try {
        const {
            userId,
            actionType,
            entityType,
            entityId,
            details,
            ipAddress
        } = options;

        // Serialize details as JSON string if it's an object
        const detailsJson = details ? JSON.stringify(details) : null;

        // Insert into audit_log table
        const query = `
            INSERT INTO volunteersync.audit_log 
                (actor_user_id, action, entity_type, entity_id, details, occurred_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        `;

        await execute(query, [
            userId || null,
            actionType,
            entityType,
            entityId || null,
            detailsJson
        ]);

        // Also log to audit log file using Winston auditLogger
        const auditPayload = {
            userId: userId || null,
            action: actionType,
            entityType,
            entityId: entityId || null,
            details: details || null,
            ipAddress: ipAddress || null,
            timestamp: new Date().toISOString()
        };

        auditLogger.info('Audit Event', auditPayload);

    } catch (error) {
        // Never throw - just log the error and continue
        // This ensures audit logging failures don't break the main operation
        logger.error('Failed to record audit event', {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error,
            options: {
                userId: options.userId,
                actionType: options.actionType,
                entityType: options.entityType,
                entityId: options.entityId,
                ipAddress: options.ipAddress
                // Don't log details in error case to avoid sensitive data in error logs
            }
        });
    }
};


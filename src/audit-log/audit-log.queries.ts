export const auditLogQueries = {
    /**
     * Get all audit logs (admin only, typically paginated)
     */
    readAuditLogs: `
        SELECT
            log_id AS logId,
            occurred_at AS occurredAt,
            actor_user_id AS actorUserId,
            action,
            entity_type AS entityType,
            entity_id AS entityId,
            details
        FROM volunteersync.audit_log
        ORDER BY occurred_at DESC
        LIMIT ? OFFSET ?
    `,

    /**
     * Get total count of audit logs
     */
    readAuditLogCount: `
        SELECT COUNT(*) AS totalCount
        FROM volunteersync.audit_log
    `,

    /**
     * Get a specific audit log by ID
     */
    readAuditLogById: `
        SELECT
            log_id AS logId,
            occurred_at AS occurredAt,
            actor_user_id AS actorUserId,
            action,
            entity_type AS entityType,
            entity_id AS entityId,
            details
        FROM volunteersync.audit_log
        WHERE log_id = ?
    `,

    /**
     * Get audit logs by actor (user who performed the action)
     */
    readAuditLogsByActor: `
        SELECT
            log_id AS logId,
            occurred_at AS occurredAt,
            actor_user_id AS actorUserId,
            action,
            entity_type AS entityType,
            entity_id AS entityId,
            details
        FROM volunteersync.audit_log
        WHERE actor_user_id = ?
        ORDER BY occurred_at DESC
        LIMIT ? OFFSET ?
    `,

    /**
     * Get audit logs by entity type and ID
     */
    readAuditLogsByEntity: `
        SELECT
            log_id AS logId,
            occurred_at AS occurredAt,
            actor_user_id AS actorUserId,
            action,
            entity_type AS entityType,
            entity_id AS entityId,
            details
        FROM volunteersync.audit_log
        WHERE entity_type = ? AND entity_id = ?
        ORDER BY occurred_at DESC
        LIMIT ? OFFSET ?
    `,

    /**
     * Get audit logs by action type
     */
    readAuditLogsByAction: `
        SELECT
            log_id AS logId,
            occurred_at AS occurredAt,
            actor_user_id AS actorUserId,
            action,
            entity_type AS entityType,
            entity_id AS entityId,
            details
        FROM volunteersync.audit_log
        WHERE action = ?
        ORDER BY occurred_at DESC
        LIMIT ? OFFSET ?
    `,

    /**
     * Get audit logs by date range
     */
    readAuditLogsByDateRange: `
        SELECT
            log_id AS logId,
            occurred_at AS occurredAt,
            actor_user_id AS actorUserId,
            action,
            entity_type AS entityType,
            entity_id AS entityId,
            details
        FROM volunteersync.audit_log
        WHERE occurred_at >= ? AND occurred_at <= ?
        ORDER BY occurred_at DESC
        LIMIT ? OFFSET ?
    `,

    /**
     * Create a new audit log entry
     */
    createAuditLog: `
        INSERT INTO volunteersync.audit_log 
            (actor_user_id, action, entity_type, entity_id, details, occurred_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    `,

    /**
     * Delete audit logs older than a specified date (for cleanup)
     */
    deleteAuditLogsOlderThan: `
        DELETE FROM volunteersync.audit_log
        WHERE occurred_at < ?
    `,

    /**
     * Delete a specific audit log entry (admin only, rarely used)
     */
    deleteAuditLog: `
        DELETE FROM volunteersync.audit_log
        WHERE log_id = ?
    `
};


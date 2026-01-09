import { OkPacket } from 'mysql';
import { execute } from '../services/mysql.connector';
import { AuditLog } from './audit-log.model';
import { auditLogQueries } from './audit-log.queries';

/**
 * Retrieves audit logs with pagination.
 * @param {number} limit - Maximum number of records to return
 * @param {number} offset - Number of records to skip
 * @returns {Promise<AuditLog[]>} Array of audit log entries
 */
export const readAuditLogs = async (limit: number = 100, offset: number = 0) => {
    return execute<AuditLog[]>(auditLogQueries.readAuditLogs, [limit, offset]);
};

/**
 * Gets the total count of audit logs.
 * @returns {Promise<{ totalCount: number }[]>} Array with total count
 */
export const readAuditLogCount = async () => {
    return execute<{ totalCount: number }[]>(auditLogQueries.readAuditLogCount, []);
};

/**
 * Retrieves a specific audit log by its ID.
 * @param {number} logId - The unique identifier of the audit log
 * @returns {Promise<AuditLog[]>} Array containing the audit log entry (or empty array if not found)
 */
export const readAuditLogById = async (logId: number) => {
    return execute<AuditLog[]>(auditLogQueries.readAuditLogById, [logId]);
};

/**
 * Retrieves audit logs by actor (user who performed the action).
 * @param {number} actorUserId - The unique identifier of the user
 * @param {number} limit - Maximum number of records to return
 * @param {number} offset - Number of records to skip
 * @returns {Promise<AuditLog[]>} Array of audit log entries
 */
export const readAuditLogsByActor = async (actorUserId: number, limit: number = 100, offset: number = 0) => {
    return execute<AuditLog[]>(auditLogQueries.readAuditLogsByActor, [actorUserId, limit, offset]);
};

/**
 * Retrieves audit logs by entity type and ID.
 * @param {string} entityType - The type of entity (e.g., 'user', 'event', 'organization')
 * @param {number} entityId - The unique identifier of the entity
 * @param {number} limit - Maximum number of records to return
 * @param {number} offset - Number of records to skip
 * @returns {Promise<AuditLog[]>} Array of audit log entries
 */
export const readAuditLogsByEntity = async (entityType: string, entityId: number, limit: number = 100, offset: number = 0) => {
    return execute<AuditLog[]>(auditLogQueries.readAuditLogsByEntity, [entityType, entityId, limit, offset]);
};

/**
 * Retrieves audit logs by action type.
 * @param {string} action - The action type (e.g., 'create', 'update', 'delete', 'login')
 * @param {number} limit - Maximum number of records to return
 * @param {number} offset - Number of records to skip
 * @returns {Promise<AuditLog[]>} Array of audit log entries
 */
export const readAuditLogsByAction = async (action: string, limit: number = 100, offset: number = 0) => {
    return execute<AuditLog[]>(auditLogQueries.readAuditLogsByAction, [action, limit, offset]);
};

/**
 * Retrieves audit logs within a date range.
 * @param {Date} startDate - Start date for the range
 * @param {Date} endDate - End date for the range
 * @param {number} limit - Maximum number of records to return
 * @param {number} offset - Number of records to skip
 * @returns {Promise<AuditLog[]>} Array of audit log entries
 */
export const readAuditLogsByDateRange = async (startDate: Date, endDate: Date, limit: number = 100, offset: number = 0) => {
    return execute<AuditLog[]>(auditLogQueries.readAuditLogsByDateRange, [startDate, endDate, limit, offset]);
};

/**
 * Creates a new audit log entry.
 * @param {AuditLog} auditLog - Audit log object containing all required fields
 * @returns {Promise<OkPacket>} MySQL result packet with insertId
 */
export const createAuditLog = async (auditLog: AuditLog) => {
    // Convert details to JSON string if it's an object
    const detailsJson = auditLog.details ? JSON.stringify(auditLog.details) : null;
    
    return execute<OkPacket>(auditLogQueries.createAuditLog, [
        auditLog.actorUserId || null,
        auditLog.action,
        auditLog.entityType,
        auditLog.entityId || null,
        detailsJson
    ]);
};

/**
 * Deletes audit logs older than a specified date (for cleanup).
 * @param {Date} beforeDate - Delete logs older than this date
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteAuditLogsOlderThan = async (beforeDate: Date) => {
    return execute<OkPacket>(auditLogQueries.deleteAuditLogsOlderThan, [beforeDate]);
};

/**
 * Deletes a specific audit log entry (admin only, rarely used).
 * @param {number} logId - The unique identifier of the audit log to delete
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteAuditLog = async (logId: number) => {
    return execute<OkPacket>(auditLogQueries.deleteAuditLog, [logId]);
};


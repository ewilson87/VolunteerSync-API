import { Request, RequestHandler, Response } from 'express';
import { OkPacket } from 'mysql';
import * as AuditLogDao from './audit-log.dao';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AuditLog } from './audit-log.model';
import logger from '../services/logger.service';

/**
 * Retrieves all audit logs with pagination (admin only).
 * 
 * @route GET /audit-log
 * @access Private (Admin only)
 * @query {number} [limit=100] - Maximum number of records to return
 * @query {number} [offset=0] - Number of records to skip
 * @returns {Promise<void>} JSON object with audit logs and pagination info
 */
export const readAuditLogs: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;

        if (!authenticatedUser || authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to read audit logs', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators can view audit logs'
            });
            return;
        }

        const limit = parseInt(req.query.limit as string) || 100;
        const offset = parseInt(req.query.offset as string) || 0;

        const [logs, countResult] = await Promise.all([
            AuditLogDao.readAuditLogs(limit, offset),
            AuditLogDao.readAuditLogCount()
        ]);

        const totalCount = countResult && countResult.length > 0 ? countResult[0].totalCount : 0;

        logger.info('Retrieved audit logs', { requestId, count: logs.length, limit, offset });
        res.status(200).json({
            logs,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + logs.length < totalCount
            }
        });
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching audit logs', {
            requestId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching audit logs'
        });
    }
};

/**
 * Retrieves a specific audit log by ID (admin only).
 * 
 * @route GET /audit-log/:logId
 * @access Private (Admin only)
 * @param {number} req.params.logId - The ID of the audit log to retrieve
 * @returns {Promise<void>} JSON object containing audit log data
 */
export const readAuditLogById: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const logId = parseInt(req.params.logId);

        if (!authenticatedUser || authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to read audit log', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators can view audit logs'
            });
            return;
        }

        const log = await AuditLogDao.readAuditLogById(logId);

        if (!log || log.length === 0) {
            res.status(404).json({
                message: 'Audit log not found'
            });
            return;
        }

        logger.info('Retrieved audit log by ID', { requestId, logId });
        res.status(200).json(log[0]);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching audit log by ID', {
            requestId,
            logId: req.params.logId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the audit log'
        });
    }
};

/**
 * Retrieves audit logs by actor (user who performed the action) (admin only).
 * 
 * @route GET /audit-log/actor/:actorUserId
 * @access Private (Admin only)
 * @param {number} req.params.actorUserId - The ID of the user
 * @query {number} [limit=100] - Maximum number of records to return
 * @query {number} [offset=0] - Number of records to skip
 * @returns {Promise<void>} JSON array of audit logs
 */
export const readAuditLogsByActor: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const actorUserId = parseInt(req.params.actorUserId);

        if (!authenticatedUser || authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to read audit logs by actor', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators can view audit logs'
            });
            return;
        }

        const limit = parseInt(req.query.limit as string) || 100;
        const offset = parseInt(req.query.offset as string) || 0;

        const logs = await AuditLogDao.readAuditLogsByActor(actorUserId, limit, offset);
        logger.info('Retrieved audit logs by actor', { requestId, actorUserId, count: logs.length });
        res.status(200).json(logs);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching audit logs by actor', {
            requestId,
            actorUserId: req.params.actorUserId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the audit logs'
        });
    }
};

/**
 * Retrieves audit logs by entity type and ID (admin only).
 * 
 * @route GET /audit-log/entity/:entityType/:entityId
 * @access Private (Admin only)
 * @param {string} req.params.entityType - The type of entity
 * @param {number} req.params.entityId - The ID of the entity
 * @query {number} [limit=100] - Maximum number of records to return
 * @query {number} [offset=0] - Number of records to skip
 * @returns {Promise<void>} JSON array of audit logs
 */
export const readAuditLogsByEntity: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const entityType = req.params.entityType;
        const entityId = parseInt(req.params.entityId);

        if (!authenticatedUser || authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to read audit logs by entity', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators can view audit logs'
            });
            return;
        }

        const limit = parseInt(req.query.limit as string) || 100;
        const offset = parseInt(req.query.offset as string) || 0;

        const logs = await AuditLogDao.readAuditLogsByEntity(entityType, entityId, limit, offset);
        logger.info('Retrieved audit logs by entity', { requestId, entityType, entityId, count: logs.length });
        res.status(200).json(logs);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching audit logs by entity', {
            requestId,
            entityType: req.params.entityType,
            entityId: req.params.entityId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the audit logs'
        });
    }
};

/**
 * Retrieves audit logs by action type (admin only).
 * 
 * @route GET /audit-log/action/:action
 * @access Private (Admin only)
 * @param {string} req.params.action - The action type
 * @query {number} [limit=100] - Maximum number of records to return
 * @query {number} [offset=0] - Number of records to skip
 * @returns {Promise<void>} JSON array of audit logs
 */
export const readAuditLogsByAction: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const action = req.params.action;

        if (!authenticatedUser || authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to read audit logs by action', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators can view audit logs'
            });
            return;
        }

        const limit = parseInt(req.query.limit as string) || 100;
        const offset = parseInt(req.query.offset as string) || 0;

        const logs = await AuditLogDao.readAuditLogsByAction(action, limit, offset);
        logger.info('Retrieved audit logs by action', { requestId, action, count: logs.length });
        res.status(200).json(logs);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching audit logs by action', {
            requestId,
            action: req.params.action,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the audit logs'
        });
    }
};

/**
 * Creates a new audit log entry.
 * This is typically called internally by the system, not directly by users.
 * 
 * @route POST /audit-log
 * @access Private (Admin or Organizer - typically system-generated)
 * @param {Object} req.body - Audit log data
 * @returns {Promise<void>} JSON object with creation result
 */
export const createAuditLog: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const auditLogData: AuditLog = req.body;

        // Only admins and organizers can create audit logs (typically system-generated)
        if (!authenticatedUser || (authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'organizer')) {
            logger.warn('Unauthorized attempt to create audit log', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators and organizers can create audit logs'
            });
            return;
        }

        const okPacket: OkPacket = await AuditLogDao.createAuditLog(auditLogData);
        logger.info('Audit log created', {
            requestId,
            logId: okPacket.insertId,
            action: auditLogData.action,
            entityType: auditLogData.entityType,
            createdBy: authenticatedUser.userId
        });
        res.status(201).json({
            ...okPacket,
            logId: okPacket.insertId
        });
    } catch (error: any) {
        const requestId = (req as any).requestId;
        logger.error('Error creating audit log', {
            requestId,
            auditLogData: req.body,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error creating the audit log'
        });
    }
};

/**
 * Deletes audit logs older than a specified date (admin only, for cleanup).
 * 
 * @route DELETE /audit-log/cleanup
 * @access Private (Admin only)
 * @query {string} beforeDate - ISO 8601 date string - delete logs older than this date
 * @returns {Promise<void>} JSON object with deletion result
 */
export const deleteAuditLogsOlderThan: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const beforeDateStr = req.query.beforeDate as string;

        if (!authenticatedUser || authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to delete audit logs', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators can delete audit logs'
            });
            return;
        }

        if (!beforeDateStr) {
            res.status(400).json({
                message: 'beforeDate query parameter is required (ISO 8601 format)'
            });
            return;
        }

        const beforeDate = new Date(beforeDateStr);
        if (isNaN(beforeDate.getTime())) {
            res.status(400).json({
                message: 'Invalid date format. Use ISO 8601 format.'
            });
            return;
        }

        const okPacket: OkPacket = await AuditLogDao.deleteAuditLogsOlderThan(beforeDate);
        logger.info('Audit logs deleted (cleanup)', {
            requestId,
            beforeDate: beforeDateStr,
            deletedCount: okPacket.affectedRows,
            userId: authenticatedUser.userId
        });
        res.status(200).json({
            message: `Successfully deleted ${okPacket.affectedRows} audit log entries`,
            deletedCount: okPacket.affectedRows
        });
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error deleting audit logs', {
            requestId,
            beforeDate: req.query.beforeDate,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error deleting audit logs'
        });
    }
};

/**
 * Deletes a specific audit log entry (admin only, rarely used).
 * 
 * @route DELETE /audit-log/:logId
 * @access Private (Admin only)
 * @param {number} req.params.logId - The ID of the audit log to delete
 * @returns {Promise<void>} JSON object with deletion result
 */
export const deleteAuditLog: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const logId = parseInt(req.params.logId);

        if (!authenticatedUser || authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to delete audit log', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators can delete audit logs'
            });
            return;
        }

        const response = await AuditLogDao.deleteAuditLog(logId);
        
        if (response.affectedRows === 0) {
            res.status(404).json({
                message: 'Audit log not found'
            });
            return;
        }

        logger.info('Audit log deleted', { requestId, logId, userId: authenticatedUser.userId });
        res.status(200).json(response);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error deleting audit log', {
            requestId,
            logId: req.params.logId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error deleting the audit log'
        });
    }
};


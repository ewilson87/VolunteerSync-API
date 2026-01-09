import { Router } from 'express';
import * as AuditLogController from './audit-log.controller';
import { authenticateToken, requireAdmin, requireOrganizerOrAdmin } from '../middleware/auth.middleware';
import { param, body, query } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const logIdParam = param('logId')
    .isInt({ min: 1 })
    .withMessage('Log ID must be a positive integer');

const actorUserIdParam = param('actorUserId')
    .isInt({ min: 1 })
    .withMessage('Actor user ID must be a positive integer');

const entityTypeParam = param('entityType')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Entity type must be between 1 and 30 characters')
    .escape();

const entityIdParam = param('entityId')
    .isInt({ min: 1 })
    .withMessage('Entity ID must be a positive integer');

const actionParam = param('action')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Action must be between 1 and 50 characters')
    .escape();

const limitQuery = query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000');

const offsetQuery = query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer');

const beforeDateQuery = query('beforeDate')
    .isISO8601()
    .withMessage('beforeDate must be a valid ISO 8601 date');

const actionBody = body('action')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Action must be between 1 and 50 characters')
    .escape();

const entityTypeBody = body('entityType')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Entity type must be between 1 and 30 characters')
    .escape();

const actorUserIdBody = body('actorUserId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Actor user ID must be a positive integer');

const entityIdBody = body('entityId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Entity ID must be a positive integer');

const detailsBody = body('details')
    .optional()
    .custom((value) => {
        // Allow objects, arrays, or null
        return typeof value === 'object' || value === null;
    })
    .withMessage('Details must be a valid JSON object or null');

// Protected routes
// GET /audit-log - Get all audit logs with pagination (Admin only)
router
    .route('/audit-log')
    .get(authenticateToken, requireAdmin, limitQuery, offsetQuery, validate, AuditLogController.readAuditLogs);

// GET /audit-log/:logId - Get a specific audit log by ID (Admin only)
router
    .route('/audit-log/:logId')
    .get(authenticateToken, requireAdmin, logIdParam, validate, AuditLogController.readAuditLogById);

// GET /audit-log/actor/:actorUserId - Get audit logs by actor (Admin only)
router
    .route('/audit-log/actor/:actorUserId')
    .get(authenticateToken, requireAdmin, actorUserIdParam, limitQuery, offsetQuery, validate, AuditLogController.readAuditLogsByActor);

// GET /audit-log/entity/:entityType/:entityId - Get audit logs by entity (Admin only)
router
    .route('/audit-log/entity/:entityType/:entityId')
    .get(authenticateToken, requireAdmin, entityTypeParam, entityIdParam, limitQuery, offsetQuery, validate, AuditLogController.readAuditLogsByEntity);

// GET /audit-log/action/:action - Get audit logs by action (Admin only)
router
    .route('/audit-log/action/:action')
    .get(authenticateToken, requireAdmin, actionParam, limitQuery, offsetQuery, validate, AuditLogController.readAuditLogsByAction);

// POST /audit-log - Create a new audit log entry (Admin or Organizer - typically system-generated)
router
    .route('/audit-log')
    .post(authenticateToken, requireOrganizerOrAdmin, actionBody, entityTypeBody, actorUserIdBody, entityIdBody, detailsBody, validate, AuditLogController.createAuditLog);

// DELETE /audit-log/cleanup - Delete audit logs older than a date (Admin only)
router
    .route('/audit-log/cleanup')
    .delete(authenticateToken, requireAdmin, beforeDateQuery, validate, AuditLogController.deleteAuditLogsOlderThan);

// DELETE /audit-log/:logId - Delete a specific audit log (Admin only)
router
    .route('/audit-log/:logId')
    .delete(authenticateToken, requireAdmin, logIdParam, validate, AuditLogController.deleteAuditLog);

export default router;


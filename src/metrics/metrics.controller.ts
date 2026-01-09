import { RequestHandler, Response } from 'express';
import * as MetricsService from './metrics.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import logger from '../services/logger.service';

/**
 * Get volunteer metrics summary.
 * 
 * @route GET /api/metrics/volunteer/summary
 * @access Private (Volunteer only)
 * @returns {Promise<void>} JSON object with volunteer metrics
 */
export const getVolunteerSummary: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;

        if (!authenticatedUser) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        if (authenticatedUser.role !== 'volunteer') {
            logger.warn('Unauthorized attempt to access volunteer metrics', {
                requestId,
                userId: authenticatedUser.userId,
                role: authenticatedUser.role
            });
            res.status(403).json({
                message: 'Only volunteers can access volunteer metrics'
            });
            return;
        }

        const summary = await MetricsService.getVolunteerMetricsSummary(authenticatedUser.userId);
        
        logger.info('Retrieved volunteer metrics', {
            requestId,
            userId: authenticatedUser.userId
        });
        
        res.status(200).json(summary);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching volunteer metrics', {
            requestId,
            userId: req.user?.userId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching volunteer metrics'
        });
    }
};

/**
 * Get organizer metrics summary.
 * 
 * @route GET /api/metrics/organizer/summary
 * @access Private (Organizer or Admin)
 * @query {number} [organizationId] - Organization ID (required for admin, ignored for organizer)
 * @returns {Promise<void>} JSON object with organizer metrics
 */
export const getOrganizerSummary: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;

        if (!authenticatedUser) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        let organizationId: number | null = null;

        // Determine which organizationId to use
        if (authenticatedUser.role === 'admin') {
            // Admin can query any organization via query parameter
            const orgIdParam = req.query.organizationId;
            if (!orgIdParam) {
                res.status(400).json({
                    message: 'organizationId query parameter is required for admin users'
                });
                return;
            }
            
            organizationId = parseInt(orgIdParam as string);
            if (isNaN(organizationId) || organizationId <= 0) {
                res.status(400).json({
                    message: 'organizationId must be a positive integer'
                });
                return;
            }

            // Verify organization exists
            const { readOrganizationById } = await import('../organizations/organizations.dao');
            const organizations = await readOrganizationById(organizationId);
            if (!organizations || organizations.length === 0) {
                res.status(404).json({
                    message: 'Organization not found'
                });
                return;
            }
        } else if (authenticatedUser.role === 'organizer') {
            // Organizer uses their own organizationId from token
            if (!authenticatedUser.organizationId) {
                res.status(400).json({
                    message: 'User is not associated with an organization'
                });
                return;
            }
            organizationId = authenticatedUser.organizationId;
        } else {
            // Should not reach here due to middleware, but check anyway
            logger.warn('Unauthorized attempt to access organizer metrics', {
                requestId,
                userId: authenticatedUser.userId,
                role: authenticatedUser.role
            });
            res.status(403).json({
                message: 'Only organizers and admins can access organizer metrics'
            });
            return;
        }

        const summary = await MetricsService.getOrganizerMetricsSummary(organizationId);
        
        logger.info('Retrieved organizer metrics', {
            requestId,
            userId: authenticatedUser.userId,
            role: authenticatedUser.role,
            organizationId: organizationId
        });
        
        res.status(200).json(summary);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching organizer metrics', {
            requestId,
            userId: req.user?.userId,
            role: req.user?.role,
            organizationId: req.query.organizationId || req.user?.organizationId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching organizer metrics'
        });
    }
};

/**
 * Get admin metrics summary.
 * 
 * @route GET /api/metrics/admin/summary
 * @access Private (Admin only)
 * @returns {Promise<void>} JSON object with admin metrics
 */
export const getAdminSummary: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;

        if (!authenticatedUser) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        if (authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to access admin metrics', {
                requestId,
                userId: authenticatedUser.userId,
                role: authenticatedUser.role
            });
            res.status(403).json({
                message: 'Only administrators can access admin metrics'
            });
            return;
        }

        const summary = await MetricsService.getAdminMetricsSummary();
        
        logger.info('Retrieved admin metrics', {
            requestId,
            userId: authenticatedUser.userId
        });
        
        res.status(200).json(summary);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching admin metrics', {
            requestId,
            userId: req.user?.userId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching admin metrics'
        });
    }
};


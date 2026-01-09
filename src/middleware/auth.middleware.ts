import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { recordAuditEvent } from '../services/audit.service';

/**
 * Extended Express Request interface that includes authenticated user information.
 * This is populated by the authenticateToken middleware after successful JWT verification.
 */
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        email: string;
        role: 'volunteer' | 'organizer' | 'admin';
        organizationId?: number | null;
    };
}

/**
 * Middleware to authenticate requests using JWT tokens.
 * Extracts the Bearer token from the Authorization header and verifies it.
 * On success, attaches user information to req.user.
 * 
 * @param {AuthenticatedRequest} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // Record audit event for unauthorized access attempt (no token)
        recordAuditEvent({
            actionType: 'unauthorized_access',
            entityType: 'auth',
            details: {
                reason: 'missing_token',
                path: req.path,
                method: req.method
            },
            ipAddress: req.ip
        }).catch(() => {
            // Silently fail if audit logging fails
        });

        res.status(401).json({
            message: 'Access token is required'
        });
        return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            // Record audit event for unauthorized access attempt (invalid/expired token)
            recordAuditEvent({
                actionType: 'unauthorized_access',
                entityType: 'auth',
                details: {
                    reason: err.name === 'TokenExpiredError' ? 'expired_token' : 'invalid_token',
                    path: req.path,
                    method: req.method,
                    error: err.name
                },
                ipAddress: req.ip
            }).catch(() => {
                // Silently fail if audit logging fails
            });

            res.status(403).json({
                message: 'Invalid or expired token'
            });
            return;
        }

        req.user = decoded as AuthenticatedRequest['user'];
        next();
    });
};

/**
 * Middleware to require admin role for access.
 * Must be used after authenticateToken middleware.
 * 
 * @param {AuthenticatedRequest} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({
            message: 'Authentication required'
        });
        return;
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({
            message: 'Admin access required'
        });
        return;
    }

    next();
};

/**
 * Middleware to allow users to access their own data, admins to access any data, or organizers to view any user.
 * Must be used after authenticateToken middleware.
 * 
 * @param {AuthenticatedRequest} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
export const requireUserOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({
            message: 'Authentication required'
        });
        return;
    }

    const requestedUserId = parseInt(req.params.userId);

    if (isNaN(requestedUserId)) {
        res.status(400).json({
            message: 'Invalid user ID'
        });
        return;
    }

    if (req.user.userId === requestedUserId || req.user.role === 'admin') {
        next();
        return;
    }

    if (req.user.role === 'organizer') {
        next();
        return;
    }

    res.status(403).json({
        message: 'Access denied. You can only access your own data or must be an admin.'
    });
};

/**
 * Middleware to require organizer role for the specified organization or admin role.
 * Checks organizationId from request params or body.
 * Must be used after authenticateToken middleware.
 * 
 * @param {AuthenticatedRequest} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
export const requireOrganizerOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({
            message: 'Authentication required'
        });
        return;
    }

    if (req.user.role === 'admin') {
        next();
        return;
    }

    let organizationId: number | null = null;

    if (req.params.organizationId) {
        organizationId = parseInt(req.params.organizationId);
    } else if (req.body.organizationId) {
        organizationId = parseInt(req.body.organizationId);
    }

    // If no organizationId is provided and user is an organizer, allow them through
    // (they'll use their own organizationId from the token)
    if (req.user.role === 'organizer' && !organizationId) {
        next();
        return;
    }

    if (req.params.eventId && !organizationId) {
        next();
        return;
    }

    if (req.user.role === 'organizer' && req.user.organizationId === organizationId) {
        next();
        return;
    }

    res.status(403).json({
        message: 'Access denied. You must be an organizer for this organization or an admin.'
    });
};

/**
 * Middleware to require organizer role for the event's organization or admin role.
 * Fetches the event to determine its organization, then verifies the user's access.
 * Must be used after authenticateToken middleware.
 * 
 * @param {AuthenticatedRequest} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
export const requireEventOrganizerOrAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        res.status(401).json({
            message: 'Authentication required'
        });
        return;
    }

    if (req.user.role === 'admin') {
        next();
        return;
    }

    let eventId: number | null = null;

    if (req.params.eventId) {
        eventId = parseInt(req.params.eventId);
    } else if (req.body.eventId) {
        eventId = parseInt(req.body.eventId);
    }

    if (!eventId || isNaN(eventId)) {
        res.status(400).json({
            message: 'Event ID is required'
        });
        return;
    }

    try {
        const { readEventById } = await import('../events/events.dao');
        const events = await readEventById(eventId);

        if (!events || events.length === 0) {
            res.status(404).json({
                message: 'Event not found'
            });
            return;
        }

        const event = events[0];

        if (req.user.role === 'organizer' && req.user.organizationId === event.organizationId) {
            next();
            return;
        }

        res.status(403).json({
            message: 'Access denied. You must be an organizer for this event\'s organization or an admin.'
        });
    } catch (error) {
        console.error('[auth.middleware][requireEventOrganizerOrAdmin][Error] ', error);
        res.status(500).json({
            message: 'Error verifying event access'
        });
    }
};

/**
 * Middleware to require organizer role for the organization specified in request body or admin role.
 * Used for endpoints where organizationId is provided in the request body (e.g., POST /events).
 * Must be used after authenticateToken middleware.
 * 
 * @param {AuthenticatedRequest} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
export const requireOrganizerForBodyOrganizationOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({
            message: 'Authentication required'
        });
        return;
    }

    if (req.user.role === 'admin') {
        next();
        return;
    }

    const organizationId = req.body.organizationId ? parseInt(req.body.organizationId) : null;

    if (!organizationId || isNaN(organizationId)) {
        res.status(400).json({
            message: 'Organization ID is required in request body'
        });
        return;
    }

    if (req.user.role === 'organizer' && req.user.organizationId === organizationId) {
        next();
        return;
    }

    res.status(403).json({
        message: 'Access denied. You must be an organizer for this organization or an admin.'
    });
};

/**
 * Middleware to require volunteer role for access.
 * Must be used after authenticateToken middleware.
 * 
 * @param {AuthenticatedRequest} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
export const requireVolunteer = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({
            message: 'Authentication required'
        });
        return;
    }

    if (req.user.role !== 'volunteer') {
        res.status(403).json({
            message: 'Volunteer access required'
        });
        return;
    }

    next();
};

/**
 * Middleware to require organizer role for access.
 * Must be used after authenticateToken middleware.
 * 
 * @param {AuthenticatedRequest} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
export const requireOrganizer = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({
            message: 'Authentication required'
        });
        return;
    }

    if (req.user.role !== 'organizer') {
        res.status(403).json({
            message: 'Organizer access required'
        });
        return;
    }

    next();
};


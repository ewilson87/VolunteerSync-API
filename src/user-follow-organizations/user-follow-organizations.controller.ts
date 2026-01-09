import { Request, RequestHandler, Response } from 'express';
import { OkPacket } from 'mysql';
import * as UserFollowOrganizationDao from './user-follow-organizations.dao';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import logger from '../services/logger.service';

/**
 * Get all organizations that a user follows.
 * 
 * @route GET /user-follow-organizations/user/:userId
 * @access Private (User can only see their own follows, or Admin/Organizer can see any)
 * @param {number} req.params.userId - The ID of the user
 * @returns {Promise<void>} JSON array of organizations the user follows
 */
export const readOrganizationsByUserId: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const userId = parseInt(req.params.userId);
        const authenticatedUser = req.user;

        // Users can only see their own follows unless they're admin/organizer
        if (authenticatedUser && authenticatedUser.userId !== userId && authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'organizer') {
            logger.warn('Unauthorized access attempt to user follows', {
                requestId,
                requestedUserId: userId,
                authenticatedUserId: authenticatedUser.userId,
                role: authenticatedUser.role
            });
            res.status(403).json({
                message: 'You can only view your own followed organizations'
            });
            return;
        }

        const organizations = await UserFollowOrganizationDao.readOrganizationsByUserId(userId);
        logger.info('Retrieved organizations followed by user', { requestId, userId, count: organizations.length });
        res.status(200).json(organizations);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching organizations followed by user', {
            requestId,
            userId: req.params.userId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the organizations'
        });
    }
};

/**
 * Get all users that follow a specific organization.
 * 
 * @route GET /user-follow-organizations/organization/:organizationId
 * @access Public (or Private for organization owners)
 * @param {number} req.params.organizationId - The ID of the organization
 * @returns {Promise<void>} JSON array of users following the organization
 */
export const readUsersByOrganizationId: RequestHandler = async (req: Request, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const organizationId = parseInt(req.params.organizationId);
        const users = await UserFollowOrganizationDao.readUsersByOrganizationId(organizationId);
        logger.info('Retrieved users following organization', { requestId, organizationId, count: users.length });
        res.status(200).json(users);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching users following organization', {
            requestId,
            organizationId: req.params.organizationId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the users'
        });
    }
};

/**
 * Check if a user follows a specific organization.
 * 
 * @route GET /user-follow-organizations/user/:userId/organization/:organizationId
 * @access Private (User can only check their own follows, or Admin/Organizer can check any)
 * @param {number} req.params.userId - The ID of the user
 * @param {number} req.params.organizationId - The ID of the organization
 * @returns {Promise<void>} JSON object indicating if the user follows the organization
 */
export const readByUserAndOrganization: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const userId = parseInt(req.params.userId);
        const organizationId = parseInt(req.params.organizationId);
        const authenticatedUser = req.user;

        // Users can only check their own follows unless they're admin/organizer
        if (authenticatedUser && authenticatedUser.userId !== userId && authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'organizer') {
            logger.warn('Unauthorized access attempt to check follow status', {
                requestId,
                requestedUserId: userId,
                authenticatedUserId: authenticatedUser.userId,
                role: authenticatedUser.role
            });
            res.status(403).json({
                message: 'You can only check your own follow status'
            });
            return;
        }

        const follow = await UserFollowOrganizationDao.readByUserAndOrganization(userId, organizationId);
        const isFollowing = follow && follow.length > 0;
        logger.info('Checked follow status', { requestId, userId, organizationId, isFollowing });
        res.status(200).json({
            userId,
            organizationId,
            isFollowing,
            followedAt: isFollowing ? follow[0].followedAt : null
        });
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error checking follow status', {
            requestId,
            userId: req.params.userId,
            organizationId: req.params.organizationId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error checking the follow status'
        });
    }
};

/**
 * Get follower count for an organization.
 * 
 * @route GET /user-follow-organizations/organization/:organizationId/count
 * @access Public
 * @param {number} req.params.organizationId - The ID of the organization
 * @returns {Promise<void>} JSON object with follower count
 */
export const readFollowerCountByOrganizationId: RequestHandler = async (req: Request, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const organizationId = parseInt(req.params.organizationId);
        const result = await UserFollowOrganizationDao.readFollowerCountByOrganizationId(organizationId);
        const followerCount = result && result.length > 0 ? result[0].followerCount : 0;
        logger.info('Retrieved follower count', { requestId, organizationId, followerCount });
        res.status(200).json({ organizationId, followerCount });
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching follower count', {
            requestId,
            organizationId: req.params.organizationId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the follower count'
        });
    }
};

/**
 * Get following count for a user (how many organizations they follow).
 * 
 * @route GET /user-follow-organizations/user/:userId/count
 * @access Private (User can only see their own count, or Admin/Organizer can see any)
 * @param {number} req.params.userId - The ID of the user
 * @returns {Promise<void>} JSON object with following count
 */
export const readFollowingCountByUserId: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const userId = parseInt(req.params.userId);
        const authenticatedUser = req.user;

        // Users can only see their own count unless they're admin/organizer
        if (authenticatedUser && authenticatedUser.userId !== userId && authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'organizer') {
            logger.warn('Unauthorized access attempt to following count', {
                requestId,
                requestedUserId: userId,
                authenticatedUserId: authenticatedUser.userId,
                role: authenticatedUser.role
            });
            res.status(403).json({
                message: 'You can only view your own following count'
            });
            return;
        }

        const result = await UserFollowOrganizationDao.readFollowingCountByUserId(userId);
        const followingCount = result && result.length > 0 ? result[0].followingCount : 0;
        logger.info('Retrieved following count', { requestId, userId, followingCount });
        res.status(200).json({ userId, followingCount });
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching following count', {
            requestId,
            userId: req.params.userId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the following count'
        });
    }
};

/**
 * Create a new follow relationship (user follows organization).
 * 
 * @route POST /user-follow-organizations
 * @access Private (User must be authenticated)
 * @param {number} req.body.userId - The ID of the user
 * @param {number} req.body.organizationId - The ID of the organization
 * @returns {Promise<void>} JSON object with creation result
 */
export const createFollow: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const { userId, organizationId } = req.body;
        const authenticatedUser = req.user;

        if (!userId || !organizationId) {
            res.status(400).json({
                message: 'userId and organizationId are required'
            });
            return;
        }

        // Users can only follow as themselves unless they're admin
        if (authenticatedUser && authenticatedUser.userId !== userId && authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to create follow for another user', {
                requestId,
                requestedUserId: userId,
                authenticatedUserId: authenticatedUser.userId,
                role: authenticatedUser.role
            });
            res.status(403).json({
                message: 'You can only follow organizations as yourself'
            });
            return;
        }

        // Check if already following
        const existing = await UserFollowOrganizationDao.readByUserAndOrganization(userId, organizationId);
        if (existing && existing.length > 0) {
            res.status(409).json({
                message: 'User already follows this organization'
            });
            return;
        }

        const okPacket: OkPacket = await UserFollowOrganizationDao.createFollow(userId, organizationId);
        logger.info('User followed organization', { requestId, userId, organizationId });
        res.status(201).json({
            message: 'Successfully followed organization',
            userId,
            organizationId,
            followedAt: new Date()
        });
    } catch (error: any) {
        const requestId = (req as any).requestId;
        logger.error('Error creating follow relationship', {
            requestId,
            userId: req.body.userId,
            organizationId: req.body.organizationId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });

        // Handle duplicate entry error
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
                message: 'User already follows this organization'
            });
            return;
        }

        res.status(500).json({
            message: 'There was an error creating the follow relationship'
        });
    }
};

/**
 * Delete a follow relationship (user unfollows organization).
 * 
 * @route DELETE /user-follow-organizations/user/:userId/organization/:organizationId
 * @access Private (User can only unfollow as themselves, or Admin can unfollow any)
 * @param {number} req.params.userId - The ID of the user
 * @param {number} req.params.organizationId - The ID of the organization
 * @returns {Promise<void>} JSON object with deletion result
 */
export const deleteFollow: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const userId = parseInt(req.params.userId);
        const organizationId = parseInt(req.params.organizationId);
        const authenticatedUser = req.user;

        // Users can only unfollow as themselves unless they're admin
        if (authenticatedUser && authenticatedUser.userId !== userId && authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to unfollow for another user', {
                requestId,
                requestedUserId: userId,
                authenticatedUserId: authenticatedUser.userId,
                role: authenticatedUser.role
            });
            res.status(403).json({
                message: 'You can only unfollow organizations as yourself'
            });
            return;
        }

        const okPacket: OkPacket = await UserFollowOrganizationDao.deleteFollow(userId, organizationId);
        
        if (okPacket.affectedRows === 0) {
            res.status(404).json({
                message: 'Follow relationship not found'
            });
            return;
        }

        logger.info('User unfollowed organization', { requestId, userId, organizationId });
        res.status(200).json({
            message: 'Successfully unfollowed organization',
            userId,
            organizationId
        });
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error deleting follow relationship', {
            requestId,
            userId: req.params.userId,
            organizationId: req.params.organizationId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error deleting the follow relationship'
        });
    }
};


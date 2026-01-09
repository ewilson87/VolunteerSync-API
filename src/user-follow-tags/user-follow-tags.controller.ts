import { Request, RequestHandler, Response } from 'express';
import { OkPacket } from 'mysql';
import * as UserFollowTagDao from './user-follow-tags.dao';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import logger from '../services/logger.service';

/**
 * Get all tags that a user follows.
 * 
 * @route GET /user-follow-tags/user/:userId
 * @access Private (User can only see their own follows, or Admin/Organizer can see any)
 * @param {number} req.params.userId - The ID of the user
 * @returns {Promise<void>} JSON array of tags the user follows
 */
export const readTagsByUserId: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const userId = parseInt(req.params.userId);
        const authenticatedUser = req.user;

        // Users can only see their own follows unless they're admin/organizer
        if (authenticatedUser && authenticatedUser.userId !== userId && authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'organizer') {
            logger.warn('Unauthorized access attempt to user tag follows', {
                requestId,
                requestedUserId: userId,
                authenticatedUserId: authenticatedUser.userId,
                role: authenticatedUser.role
            });
            res.status(403).json({
                message: 'You can only view your own followed tags'
            });
            return;
        }

        const tags = await UserFollowTagDao.readTagsByUserId(userId);
        logger.info('Retrieved tags followed by user', { requestId, userId, count: tags.length });
        res.status(200).json(tags);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching tags followed by user', {
            requestId,
            userId: req.params.userId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the tags'
        });
    }
};

/**
 * Get all users that follow a specific tag.
 * 
 * @route GET /user-follow-tags/tag/:tagId
 * @access Public (or Private for tag owners)
 * @param {number} req.params.tagId - The ID of the tag
 * @returns {Promise<void>} JSON array of users following the tag
 */
export const readUsersByTagId: RequestHandler = async (req: Request, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const tagId = parseInt(req.params.tagId);
        const users = await UserFollowTagDao.readUsersByTagId(tagId);
        logger.info('Retrieved users following tag', { requestId, tagId, count: users.length });
        res.status(200).json(users);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching users following tag', {
            requestId,
            tagId: req.params.tagId,
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
 * Check if a user follows a specific tag.
 * 
 * @route GET /user-follow-tags/user/:userId/tag/:tagId
 * @access Private (User can only check their own follows, or Admin/Organizer can check any)
 * @param {number} req.params.userId - The ID of the user
 * @param {number} req.params.tagId - The ID of the tag
 * @returns {Promise<void>} JSON object indicating if the user follows the tag
 */
export const readByUserAndTag: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const userId = parseInt(req.params.userId);
        const tagId = parseInt(req.params.tagId);
        const authenticatedUser = req.user;

        // Users can only check their own follows unless they're admin/organizer
        if (authenticatedUser && authenticatedUser.userId !== userId && authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'organizer') {
            logger.warn('Unauthorized access attempt to check tag follow status', {
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

        const follow = await UserFollowTagDao.readByUserAndTag(userId, tagId);
        const isFollowing = follow && follow.length > 0;
        logger.info('Checked tag follow status', { requestId, userId, tagId, isFollowing });
        res.status(200).json({
            userId,
            tagId,
            isFollowing,
            followedAt: isFollowing ? follow[0].followedAt : null
        });
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error checking tag follow status', {
            requestId,
            userId: req.params.userId,
            tagId: req.params.tagId,
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
 * Get follower count for a tag.
 * 
 * @route GET /user-follow-tags/tag/:tagId/count
 * @access Public
 * @param {number} req.params.tagId - The ID of the tag
 * @returns {Promise<void>} JSON object with follower count
 */
export const readFollowerCountByTagId: RequestHandler = async (req: Request, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const tagId = parseInt(req.params.tagId);
        const result = await UserFollowTagDao.readFollowerCountByTagId(tagId);
        const followerCount = result && result.length > 0 ? result[0].followerCount : 0;
        logger.info('Retrieved tag follower count', { requestId, tagId, followerCount });
        res.status(200).json({ tagId, followerCount });
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching tag follower count', {
            requestId,
            tagId: req.params.tagId,
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
 * Get following count for a user (how many tags they follow).
 * 
 * @route GET /user-follow-tags/user/:userId/count
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
            logger.warn('Unauthorized access attempt to tag following count', {
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

        const result = await UserFollowTagDao.readFollowingCountByUserId(userId);
        const followingCount = result && result.length > 0 ? result[0].followingCount : 0;
        logger.info('Retrieved tag following count', { requestId, userId, followingCount });
        res.status(200).json({ userId, followingCount });
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching tag following count', {
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
 * Create a new follow relationship (user follows tag).
 * 
 * @route POST /user-follow-tags
 * @access Private (User must be authenticated)
 * @param {number} req.body.userId - The ID of the user
 * @param {number} req.body.tagId - The ID of the tag
 * @returns {Promise<void>} JSON object with creation result
 */
export const createFollow: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const { userId, tagId } = req.body;
        const authenticatedUser = req.user;

        if (!userId || !tagId) {
            res.status(400).json({
                message: 'userId and tagId are required'
            });
            return;
        }

        // Users can only follow as themselves unless they're admin
        if (authenticatedUser && authenticatedUser.userId !== userId && authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to create tag follow for another user', {
                requestId,
                requestedUserId: userId,
                authenticatedUserId: authenticatedUser.userId,
                role: authenticatedUser.role
            });
            res.status(403).json({
                message: 'You can only follow tags as yourself'
            });
            return;
        }

        // Check if already following
        const existing = await UserFollowTagDao.readByUserAndTag(userId, tagId);
        if (existing && existing.length > 0) {
            res.status(409).json({
                message: 'User already follows this tag'
            });
            return;
        }

        const okPacket: OkPacket = await UserFollowTagDao.createFollow(userId, tagId);
        logger.info('User followed tag', { requestId, userId, tagId });
        res.status(201).json({
            message: 'Successfully followed tag',
            userId,
            tagId,
            followedAt: new Date()
        });
    } catch (error: any) {
        const requestId = (req as any).requestId;
        logger.error('Error creating tag follow relationship', {
            requestId,
            userId: req.body.userId,
            tagId: req.body.tagId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });

        // Handle duplicate entry error
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
                message: 'User already follows this tag'
            });
            return;
        }

        res.status(500).json({
            message: 'There was an error creating the follow relationship'
        });
    }
};

/**
 * Delete a follow relationship (user unfollows tag).
 * 
 * @route DELETE /user-follow-tags/user/:userId/tag/:tagId
 * @access Private (User can only unfollow as themselves, or Admin can unfollow any)
 * @param {number} req.params.userId - The ID of the user
 * @param {number} req.params.tagId - The ID of the tag
 * @returns {Promise<void>} JSON object with deletion result
 */
export const deleteFollow: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const userId = parseInt(req.params.userId);
        const tagId = parseInt(req.params.tagId);
        const authenticatedUser = req.user;

        // Users can only unfollow as themselves unless they're admin
        if (authenticatedUser && authenticatedUser.userId !== userId && authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to unfollow tag for another user', {
                requestId,
                requestedUserId: userId,
                authenticatedUserId: authenticatedUser.userId,
                role: authenticatedUser.role
            });
            res.status(403).json({
                message: 'You can only unfollow tags as yourself'
            });
            return;
        }

        const okPacket: OkPacket = await UserFollowTagDao.deleteFollow(userId, tagId);
        
        if (okPacket.affectedRows === 0) {
            res.status(404).json({
                message: 'Follow relationship not found'
            });
            return;
        }

        logger.info('User unfollowed tag', { requestId, userId, tagId });
        res.status(200).json({
            message: 'Successfully unfollowed tag',
            userId,
            tagId
        });
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error deleting tag follow relationship', {
            requestId,
            userId: req.params.userId,
            tagId: req.params.tagId,
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


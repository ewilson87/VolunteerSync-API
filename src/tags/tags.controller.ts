import { Request, RequestHandler, Response } from 'express';
import { OkPacket } from 'mysql';
import * as TagsDao from './tags.dao';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import logger from '../services/logger.service';

/**
 * Retrieves all tags from the database.
 * 
 * @route GET /tags
 * @access Public
 * @returns {Promise<void>} JSON array of all tags
 */
export const readTags: RequestHandler = async (req: Request, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const tags = await TagsDao.readTags();
        logger.info('Retrieved all tags', { requestId, count: tags.length });
        res.status(200).json(tags);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching tags', {
            requestId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching tags'
        });
    }
};

/**
 * Retrieves a specific tag by ID.
 * 
 * @route GET /tags/:tagId
 * @access Public
 * @param {number} req.params.tagId - The ID of the tag to retrieve
 * @returns {Promise<void>} JSON object containing tag data
 */
export const readTagById: RequestHandler = async (req: Request, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const tagId = parseInt(req.params.tagId);
        const tag = await TagsDao.readTagById(tagId);

        if (!tag || tag.length === 0) {
            res.status(404).json({
                message: 'Tag not found'
            });
            return;
        }

        logger.info('Retrieved tag by ID', { requestId, tagId });
        res.status(200).json(tag[0]);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching tag by ID', {
            requestId,
            tagId: req.params.tagId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the tag'
        });
    }
};

/**
 * Retrieves a tag by name.
 * 
 * @route GET /tags/name/:name
 * @access Public
 * @param {string} req.params.name - The name of the tag to retrieve
 * @returns {Promise<void>} JSON object containing tag data
 */
export const readTagByName: RequestHandler = async (req: Request, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const name = req.params.name;
        const tag = await TagsDao.readTagByName(name);

        if (!tag || tag.length === 0) {
            res.status(404).json({
                message: 'Tag not found'
            });
            return;
        }

        logger.info('Retrieved tag by name', { requestId, name });
        res.status(200).json(tag[0]);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching tag by name', {
            requestId,
            name: req.params.name,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the tag'
        });
    }
};

/**
 * Creates a new tag.
 * 
 * @route POST /tags
 * @access Private (Admin or Organizer)
 * @param {Object} req.body - Tag data
 * @param {string} req.body.name - The name of the tag
 * @returns {Promise<void>} JSON object with creation result
 */
export const createTag: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const tagData = req.body;

        // Check if user is admin or organizer
        if (!authenticatedUser || (authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'organizer')) {
            logger.warn('Unauthorized attempt to create tag', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators and organizers can create tags'
            });
            return;
        }

        const okPacket: OkPacket = await TagsDao.createTag(tagData);
        logger.info('Tag created', { requestId, tagId: okPacket.insertId, name: tagData.name, userId: authenticatedUser.userId });
        res.status(201).json({
            ...okPacket,
            tagId: okPacket.insertId
        });
    } catch (error: any) {
        const requestId = (req as any).requestId;
        logger.error('Error creating tag', {
            requestId,
            tagData: req.body,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });

        // Handle duplicate tag name error
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({
                message: 'A tag with this name already exists',
                errors: {
                    name: ['A tag with this name already exists']
                }
            });
            return;
        }

        res.status(500).json({
            message: 'There was an error creating the tag'
        });
    }
};

/**
 * Updates an existing tag.
 * 
 * @route PUT /tags
 * @access Private (Admin or Organizer)
 * @param {number} req.body.tagId - The ID of the tag to update
 * @param {Object} req.body - Updated tag data
 * @returns {Promise<void>} JSON object with update result
 */
export const updateTag: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const tagData = req.body;

        // Check if user is admin or organizer
        if (!authenticatedUser || (authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'organizer')) {
            logger.warn('Unauthorized attempt to update tag', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators and organizers can update tags'
            });
            return;
        }

        const okPacket: OkPacket = await TagsDao.updateTag(tagData);
        
        if (okPacket.affectedRows === 0) {
            res.status(404).json({
                message: 'Tag not found'
            });
            return;
        }

        logger.info('Tag updated', { requestId, tagId: tagData.tagId, userId: authenticatedUser.userId });
        res.status(200).json(okPacket);
    } catch (error: any) {
        const requestId = (req as any).requestId;
        logger.error('Error updating tag', {
            requestId,
            tagData: req.body,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });

        // Handle duplicate tag name error
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({
                message: 'A tag with this name already exists',
                errors: {
                    name: ['A tag with this name already exists']
                }
            });
            return;
        }

        res.status(500).json({
            message: 'There was an error updating the tag'
        });
    }
};

/**
 * Deletes a tag from the database.
 * 
 * @route DELETE /tags/:tagId
 * @access Private (Admin only)
 * @param {number} req.params.tagId - The ID of the tag to delete
 * @returns {Promise<void>} JSON object with deletion result
 */
export const deleteTag: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const tagId = parseInt(req.params.tagId);

        // Check if user is admin
        if (!authenticatedUser || authenticatedUser.role !== 'admin') {
            logger.warn('Unauthorized attempt to delete tag', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators can delete tags'
            });
            return;
        }

        const response = await TagsDao.deleteTag(tagId);
        
        if (response.affectedRows === 0) {
            res.status(404).json({
                message: 'Tag not found'
            });
            return;
        }

        logger.info('Tag deleted', { requestId, tagId, userId: authenticatedUser.userId });
        res.status(200).json(response);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error deleting tag', {
            requestId,
            tagId: req.params.tagId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error deleting the tag'
        });
    }
};


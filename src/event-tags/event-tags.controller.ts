import { Request, RequestHandler, Response } from 'express';
import { OkPacket } from 'mysql';
import * as EventTagDao from './event-tags.dao';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import logger from '../services/logger.service';

/**
 * Get all tags for a specific event.
 * 
 * @route GET /event-tags/event/:eventId
 * @access Public
 * @param {number} req.params.eventId - The ID of the event
 * @returns {Promise<void>} JSON array of tags for the event
 */
export const readTagsByEventId: RequestHandler = async (req: Request, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const eventId = parseInt(req.params.eventId);
        const tags = await EventTagDao.readTagsByEventId(eventId);
        logger.info('Retrieved tags for event', { requestId, eventId, count: tags.length });
        res.status(200).json(tags);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching tags for event', {
            requestId,
            eventId: req.params.eventId,
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
 * Get all events for a specific tag.
 * 
 * @route GET /event-tags/tag/:tagId
 * @access Public
 * @param {number} req.params.tagId - The ID of the tag
 * @returns {Promise<void>} JSON array of events for the tag
 */
export const readEventsByTagId: RequestHandler = async (req: Request, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const tagId = parseInt(req.params.tagId);
        const events = await EventTagDao.readEventsByTagId(tagId);
        logger.info('Retrieved events for tag', { requestId, tagId, count: events.length });
        res.status(200).json(events);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching events for tag', {
            requestId,
            tagId: req.params.tagId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the events'
        });
    }
};

/**
 * Check if an event has a specific tag.
 * 
 * @route GET /event-tags/event/:eventId/tag/:tagId
 * @access Public
 * @param {number} req.params.eventId - The ID of the event
 * @param {number} req.params.tagId - The ID of the tag
 * @returns {Promise<void>} JSON object indicating if the event has the tag
 */
export const readByEventAndTag: RequestHandler = async (req: Request, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const eventId = parseInt(req.params.eventId);
        const tagId = parseInt(req.params.tagId);
        const eventTag = await EventTagDao.readByEventAndTag(eventId, tagId);
        const hasTag = eventTag && eventTag.length > 0;
        logger.info('Checked event-tag relationship', { requestId, eventId, tagId, hasTag });
        res.status(200).json({
            eventId,
            tagId,
            hasTag
        });
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error checking event-tag relationship', {
            requestId,
            eventId: req.params.eventId,
            tagId: req.params.tagId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error checking the relationship'
        });
    }
};

/**
 * Get tag count for an event.
 * 
 * @route GET /event-tags/event/:eventId/count
 * @access Public
 * @param {number} req.params.eventId - The ID of the event
 * @returns {Promise<void>} JSON object with tag count
 */
export const readTagCountByEventId: RequestHandler = async (req: Request, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const eventId = parseInt(req.params.eventId);
        const result = await EventTagDao.readTagCountByEventId(eventId);
        const tagCount = result && result.length > 0 ? result[0].tagCount : 0;
        logger.info('Retrieved tag count for event', { requestId, eventId, tagCount });
        res.status(200).json({ eventId, tagCount });
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching tag count for event', {
            requestId,
            eventId: req.params.eventId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the tag count'
        });
    }
};

/**
 * Get event count for a tag.
 * 
 * @route GET /event-tags/tag/:tagId/count
 * @access Public
 * @param {number} req.params.tagId - The ID of the tag
 * @returns {Promise<void>} JSON object with event count
 */
export const readEventCountByTagId: RequestHandler = async (req: Request, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const tagId = parseInt(req.params.tagId);
        const result = await EventTagDao.readEventCountByTagId(tagId);
        const eventCount = result && result.length > 0 ? result[0].eventCount : 0;
        logger.info('Retrieved event count for tag', { requestId, tagId, eventCount });
        res.status(200).json({ tagId, eventCount });
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching event count for tag', {
            requestId,
            tagId: req.params.tagId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching the event count'
        });
    }
};

/**
 * Create a new event-tag relationship (add tag to event).
 * 
 * @route POST /event-tags
 * @access Private (Admin or Organizer)
 * @param {number} req.body.eventId - The ID of the event
 * @param {number} req.body.tagId - The ID of the tag
 * @returns {Promise<void>} JSON object with creation result
 */
export const createEventTag: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const { eventId, tagId } = req.body;

        if (!authenticatedUser || (authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'organizer')) {
            logger.warn('Unauthorized attempt to create event-tag relationship', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators and organizers can add tags to events'
            });
            return;
        }

        if (!eventId || !tagId) {
            res.status(400).json({
                message: 'eventId and tagId are required'
            });
            return;
        }

        // Check if relationship already exists
        const existing = await EventTagDao.readByEventAndTag(eventId, tagId);
        if (existing && existing.length > 0) {
            res.status(409).json({
                message: 'Event already has this tag'
            });
            return;
        }

        const okPacket: OkPacket = await EventTagDao.createEventTag(eventId, tagId);
        logger.info('Event-tag relationship created', {
            requestId,
            eventId,
            tagId,
            userId: authenticatedUser.userId
        });
        res.status(201).json({
            message: 'Successfully added tag to event',
            eventId,
            tagId
        });
    } catch (error: any) {
        const requestId = (req as any).requestId;
        logger.error('Error creating event-tag relationship', {
            requestId,
            eventId: req.body.eventId,
            tagId: req.body.tagId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });

        // Handle duplicate entry error
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
                message: 'Event already has this tag'
            });
            return;
        }

        res.status(500).json({
            message: 'There was an error creating the relationship'
        });
    }
};

/**
 * Delete an event-tag relationship (remove tag from event).
 * 
 * @route DELETE /event-tags/event/:eventId/tag/:tagId
 * @access Private (Admin or Organizer)
 * @param {number} req.params.eventId - The ID of the event
 * @param {number} req.params.tagId - The ID of the tag
 * @returns {Promise<void>} JSON object with deletion result
 */
export const deleteEventTag: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const requestId = (req as any).requestId;
        const authenticatedUser = req.user;
        const eventId = parseInt(req.params.eventId);
        const tagId = parseInt(req.params.tagId);

        if (!authenticatedUser || (authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'organizer')) {
            logger.warn('Unauthorized attempt to delete event-tag relationship', {
                requestId,
                userId: authenticatedUser?.userId,
                role: authenticatedUser?.role
            });
            res.status(403).json({
                message: 'Only administrators and organizers can remove tags from events'
            });
            return;
        }

        const okPacket: OkPacket = await EventTagDao.deleteEventTag(eventId, tagId);
        
        if (okPacket.affectedRows === 0) {
            res.status(404).json({
                message: 'Event-tag relationship not found'
            });
            return;
        }

        logger.info('Event-tag relationship deleted', {
            requestId,
            eventId,
            tagId,
            userId: authenticatedUser.userId
        });
        res.status(200).json({
            message: 'Successfully removed tag from event',
            eventId,
            tagId
        });
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error deleting event-tag relationship', {
            requestId,
            eventId: req.params.eventId,
            tagId: req.params.tagId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error deleting the relationship'
        });
    }
};


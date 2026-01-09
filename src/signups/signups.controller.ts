import { Request, RequestHandler, Response } from 'express';
import { OkPacket } from 'mysql';
import * as SignupsDao from './signups.dao';
import * as EventsDao from '../events/events.dao';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { recordAuditEvent } from '../services/audit.service';

/**
 * Retrieves all signups from the database.
 * 
 * @route GET /signups
 * @access Private (Admin only)
 * @returns {Promise<void>} JSON array of all signups
 */
export const readSignups: RequestHandler = async (req: Request, res: Response) => {
    try {
        const signups = await SignupsDao.readSignups();
        res.status(200).json(signups);
    } catch (error) {
        console.error('[signups.controller][readSignups][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching signups'
        });
    }
};

/**
 * Retrieves all signups for a specific user.
 * 
 * @route GET /signups/user/:userId
 * @access Private
 * @param {number} req.params.userId - The ID of the user
 * @returns {Promise<void>} JSON array of signups for the user
 */
export const readSignupsByUserId: RequestHandler = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId);
        const signups = await SignupsDao.readSignupsByUserId(userId);
        res.status(200).json(signups);
    } catch (error) {
        console.error('[signups.controller][readSignupsByUserId][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching user signups'
        });
    }
};

/**
 * Retrieves all signups for a specific event.
 * 
 * @route GET /signups/event/:eventId
 * @access Private
 * @param {number} req.params.eventId - The ID of the event
 * @returns {Promise<void>} JSON array of signups for the event
 */
export const readSignupsByEventId: RequestHandler = async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const signups = await SignupsDao.readSignupsByEventId(eventId);
        res.status(200).json(signups);
    } catch (error) {
        console.error('[signups.controller][readSignupsByEventId][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching event signups'
        });
    }
};

/**
 * Registers a user for an event.
 * Automatically increments the event's signup count.
 * 
 * @route POST /signups
 * @access Private
 * @param {number} req.body.userId - The ID of the user registering
 * @param {number} req.body.eventId - The ID of the event to register for
 * @returns {Promise<void>} JSON object with creation result
 */
export const createSignup: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const okPacket: OkPacket = await SignupsDao.createSignup(req.body);
        await EventsDao.incrementSignupCount(req.body.eventId);
        
        // Record audit event for successful signup
        await recordAuditEvent({
            userId: req.user?.userId || req.body.userId,
            actionType: 'create',
            entityType: 'signup',
            entityId: okPacket.insertId,
            details: {
                eventId: req.body.eventId,
                userId: req.user?.userId || req.body.userId
            },
            ipAddress: req.ip
        });

        res.status(200).json(okPacket);
    } catch (error: any) {
        console.error('[signups.controller][createSignup][Error] ', error);

        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({
                message: 'User is already signed up for this event'
            });
            return;
        }

        res.status(500).json({
            message: 'There was an error creating the signup'
        });
    }
};

/**
 * De-registers a user from an event.
 * Automatically decrements the event's signup count.
 * 
 * @route DELETE /signups/:signupId
 * @access Private
 * @param {number} req.params.signupId - The ID of the signup to delete
 * @returns {Promise<void>} JSON object with deletion result
 */
export const deleteSignup: RequestHandler = async (req: Request, res: Response) => {
    try {
        const signupId = parseInt(req.params.signupId);
        const signup = await SignupsDao.readSignupById(signupId);

        if (!signup) {
            res.status(404).json({
                message: 'Signup not found'
            });
            return;
        }

        const response = await SignupsDao.deleteSignup(signupId);
        await EventsDao.decrementSignupCount(signup.eventId);

        res.status(200).json(response);
    } catch (error) {
        console.error('[signups.controller][deleteSignup][Error] ', error);
        res.status(500).json({
            message: 'There was an error deleting the signup'
        });
    }
};

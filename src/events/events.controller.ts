import { Request, RequestHandler, Response } from 'express';
import { Event } from './events.model';
import * as EventsDao from './events.dao';
import * as OrganizationsDao from '../organizations/organizations.dao';
import { OkPacket } from 'mysql';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { recordAuditEvent } from '../services/audit.service';

/**
 * Retrieves all events from the database.
 * 
 * @route GET /events
 * @access Public
 * @returns {Promise<void>} JSON array of all events
 */
export const readEvents: RequestHandler = async (req: Request, res: Response) => {
    try {
        const events = await EventsDao.readEvents();
        res.status(200).json(events);
    } catch (error) {
        console.error('[events.controller][readEvents][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching events'
        });
    }
};

/**
 * Retrieves a specific event by ID.
 * 
 * @route GET /events/:eventId
 * @access Public
 * @param {number} req.params.eventId - The ID of the event to retrieve
 * @returns {Promise<void>} JSON object containing event data
 */
export const readEventById: RequestHandler = async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.eventId as string);
        if (Number.isNaN(eventId)) throw new Error("Invalid event ID");

        const event = await EventsDao.readEventById(eventId);
        res.status(200).json(event);
    } catch (error) {
        console.error('[events.controller][readEventById][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching the event'
        });
    }
};

/**
 * Searches events by city, state, date, and/or organization ID.
 * 
 * @route GET /events/search
 * @access Public
 * @param {string} [req.query.city] - City to filter by
 * @param {string} [req.query.state] - State to filter by (2-letter code)
 * @param {string} [req.query.date] - Date to filter by (ISO 8601 format)
 * @param {number} [req.query.organizationId] - Organization ID to filter by
 * @returns {Promise<void>} JSON array of matching events
 */
export const searchEvents: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { city, state, date, organizationId } = req.query;
        const events = await EventsDao.searchEvents(
            city as string, state as string, date as string, Number(organizationId)
        );
        res.status(200).json(events);
    } catch (error) {
        console.error('[events.controller][searchEvents][Error] ', error);
        res.status(500).json({
            message: 'There was an error searching events'
        });
    }
};

/**
 * Creates a new event.
 * Requires the associated organization to have 'approved' status.
 * 
 * @route POST /events
 * @access Private (Organizer for organization or Admin)
 * @param {Object} req.body - Event data including title, description, eventDate, etc.
 * @returns {Promise<void>} JSON object with creation result
 */
export const createEvent: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const organizationId = req.body.organizationId;
        if (organizationId) {
            const organizations = await OrganizationsDao.readOrganizationById(organizationId);
            if (organizations && organizations.length > 0) {
                const organization = organizations[0];
                if (organization.approvalStatus !== 'approved') {
                    res.status(403).json({
                        message: `Cannot create events for organizations with ${organization.approvalStatus} approval status. Only approved organizations can create events.`
                    });
                    return;
                }
            }
        }

        const okPacket: OkPacket = await EventsDao.createEvent(req.body);
        
        // Record audit event for successful event creation
        await recordAuditEvent({
            userId: req.user?.userId,
            actionType: 'create',
            entityType: 'event',
            entityId: okPacket.insertId,
            details: {
                title: req.body.title,
                organizationId: req.body.organizationId,
                eventDate: req.body.eventDate,
                city: req.body.city,
                state: req.body.state
            },
            ipAddress: req.ip
        });

        res.status(201).json(okPacket);
    } catch (error: any) {
        console.error('[events.controller][createEvent][Error] ', error);

        // Handle duplicate event error
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({
                message: 'An event with this title, date, time, and location already exists for this organization'
            });
            return;
        }

        res.status(500).json({
            message: 'There was an error creating the event'
        });
    }
};

/**
 * Updates an existing event.
 * Requires the associated organization to have 'approved' status.
 * 
 * @route PUT /events
 * @access Private (Organizer for event's organization or Admin)
 * @param {number} req.body.eventId - The ID of the event to update
 * @param {Object} req.body - Updated event data
 * @returns {Promise<void>} JSON object with update result
 */
export const updateEvent: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const eventId = req.body.eventId;
        if (!eventId) {
            res.status(400).json({
                message: 'Event ID is required'
            });
            return;
        }

        const events = await EventsDao.readEventById(eventId);
        if (!events || events.length === 0) {
            res.status(404).json({
                message: 'Event not found'
            });
            return;
        }

        const existingEvent = events[0];
        const organizationId = existingEvent.organizationId;

        if (organizationId) {
            const organizations = await OrganizationsDao.readOrganizationById(organizationId);
            if (organizations && organizations.length > 0) {
                const organization = organizations[0];
                if (organization.approvalStatus !== 'approved') {
                    res.status(403).json({
                        message: `Cannot update events for organizations with ${organization.approvalStatus} approval status. Only approved organizations can update events.`
                    });
                    return;
                }
            }
        }

        const okPacket: OkPacket = await EventsDao.updateEvent(req.body);
        
        // Record audit event for successful event update
        const updatedFields = Object.keys(req.body).filter(key => 
            key !== 'eventId' && req.body[key] !== undefined
        );
        
        await recordAuditEvent({
            userId: req.user?.userId,
            actionType: 'update',
            entityType: 'event',
            entityId: eventId,
            details: {
                updatedFields: updatedFields,
                title: req.body.title || existingEvent.title,
                organizationId: organizationId
            },
            ipAddress: req.ip
        });

        res.status(200).json(okPacket);
    } catch (error: any) {
        console.error('[events.controller][updateEvent][Error] ', error);

        // Handle duplicate event error
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({
                message: 'An event with this title, date, time, and location already exists for this organization'
            });
            return;
        }

        res.status(500).json({
            message: 'There was an error updating the event'
        });
    }
};

/**
 * Deletes an event from the database.
 * 
 * @route DELETE /events/:eventId
 * @access Private (Organizer for event's organization or Admin)
 * @param {number} req.params.eventId - The ID of the event to delete
 * @returns {Promise<void>} JSON object with deletion result
 */
export const deleteEvent: RequestHandler = async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.eventId as string);
        if (Number.isNaN(eventId)) throw new Error("Invalid event ID");

        const response = await EventsDao.deleteEvent(eventId);
        res.status(200).json(response);
    } catch (error) {
        console.error('[events.controller][deleteEvent][Error] ', error);
        res.status(500).json({
            message: 'There was an error deleting the event'
        });
    }
};

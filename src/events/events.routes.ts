import { Router } from 'express';
import * as EventsController from './events.controller';
import { authenticateToken, requireEventOrganizerOrAdmin, requireOrganizerForBodyOrganizationOrAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes (no authentication required)
// GET /events - Retrieve all events
router.
    route('/events').
    get(EventsController.readEvents);

// GET /events/search - Search events by city, state, date, and/or organization
router.
    route('/events/search').
    get(EventsController.searchEvents);

// GET /events/:eventId - Retrieve a specific event by ID
router.
    route('/events/:eventId').
    get(EventsController.readEventById);

// Protected routes
// POST /events - Create a new event (Organizer for organization or Admin only)
router.
    route('/events').
    post(authenticateToken, requireOrganizerForBodyOrganizationOrAdmin, EventsController.createEvent);

// PUT /events - Update an existing event (Organizer for organization or Admin only)
router.
    route('/events').
    put(authenticateToken, requireEventOrganizerOrAdmin, EventsController.updateEvent);

// DELETE /events/:eventId - Delete an event (Organizer for event's organization or Admin only)
router.
    route('/events/:eventId').
    delete(authenticateToken, requireEventOrganizerOrAdmin, EventsController.deleteEvent);

export default router;

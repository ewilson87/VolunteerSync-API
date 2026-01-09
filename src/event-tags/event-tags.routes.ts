import { Router } from 'express';
import * as EventTagController from './event-tags.controller';
import { authenticateToken, requireOrganizerOrAdmin } from '../middleware/auth.middleware';
import { param, body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const eventIdParam = param('eventId')
    .isInt({ min: 1 })
    .withMessage('Event ID must be a positive integer');

const tagIdParam = param('tagId')
    .isInt({ min: 1 })
    .withMessage('Tag ID must be a positive integer');

const eventIdBody = body('eventId')
    .isInt({ min: 1 })
    .withMessage('Event ID must be a positive integer');

const tagIdBody = body('tagId')
    .isInt({ min: 1 })
    .withMessage('Tag ID must be a positive integer');

// Public routes
// GET /event-tags/event/:eventId - Get all tags for an event
router
    .route('/event-tags/event/:eventId')
    .get(eventIdParam, validate, EventTagController.readTagsByEventId);

// GET /event-tags/tag/:tagId - Get all events for a tag
router
    .route('/event-tags/tag/:tagId')
    .get(tagIdParam, validate, EventTagController.readEventsByTagId);

// GET /event-tags/event/:eventId/tag/:tagId - Check if event has tag
router
    .route('/event-tags/event/:eventId/tag/:tagId')
    .get(eventIdParam, tagIdParam, validate, EventTagController.readByEventAndTag);

// GET /event-tags/event/:eventId/count - Get tag count for an event
router
    .route('/event-tags/event/:eventId/count')
    .get(eventIdParam, validate, EventTagController.readTagCountByEventId);

// GET /event-tags/tag/:tagId/count - Get event count for a tag
router
    .route('/event-tags/tag/:tagId/count')
    .get(tagIdParam, validate, EventTagController.readEventCountByTagId);

// Protected routes (authentication required)
// POST /event-tags - Create an event-tag relationship (add tag to event)
router
    .route('/event-tags')
    .post(authenticateToken, requireOrganizerOrAdmin, eventIdBody, tagIdBody, validate, EventTagController.createEventTag);

// DELETE /event-tags/event/:eventId/tag/:tagId - Delete an event-tag relationship (remove tag from event)
router
    .route('/event-tags/event/:eventId/tag/:tagId')
    .delete(authenticateToken, requireOrganizerOrAdmin, eventIdParam, tagIdParam, validate, EventTagController.deleteEventTag);

export default router;


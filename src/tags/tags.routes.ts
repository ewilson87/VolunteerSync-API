import { Router } from 'express';
import * as TagsController from './tags.controller';
import { authenticateToken, requireOrganizerOrAdmin, requireAdmin } from '../middleware/auth.middleware';
import { param, body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const tagIdParam = param('tagId')
    .isInt({ min: 1 })
    .withMessage('Tag ID must be a positive integer');

const tagNameParam = param('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tag name must be between 1 and 50 characters')
    .escape();

const tagNameBody = body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tag name must be between 1 and 50 characters')
    .escape();

const tagIdBody = body('tagId')
    .isInt({ min: 1 })
    .withMessage('Tag ID must be a positive integer');

// Public routes
// GET /tags - Get all tags
router
    .route('/tags')
    .get(TagsController.readTags);

// GET /tags/:tagId - Get a specific tag by ID
router
    .route('/tags/:tagId')
    .get(tagIdParam, validate, TagsController.readTagById);

// GET /tags/name/:name - Get a specific tag by name
router
    .route('/tags/name/:name')
    .get(tagNameParam, validate, TagsController.readTagByName);

// Protected routes
// POST /tags - Create a new tag (Admin or Organizer)
router
    .route('/tags')
    .post(authenticateToken, requireOrganizerOrAdmin, tagNameBody, validate, TagsController.createTag);

// PUT /tags - Update an existing tag (Admin or Organizer)
router
    .route('/tags')
    .put(authenticateToken, requireOrganizerOrAdmin, tagIdBody, tagNameBody, validate, TagsController.updateTag);

// DELETE /tags/:tagId - Delete a tag (Admin only)
router
    .route('/tags/:tagId')
    .delete(authenticateToken, requireAdmin, tagIdParam, validate, TagsController.deleteTag);

export default router;


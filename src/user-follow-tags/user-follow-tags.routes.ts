import { Router } from 'express';
import * as UserFollowTagController from './user-follow-tags.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { param, body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const userIdParam = param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer');

const tagIdParam = param('tagId')
    .isInt({ min: 1 })
    .withMessage('Tag ID must be a positive integer');

const userIdBody = body('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer');

const tagIdBody = body('tagId')
    .isInt({ min: 1 })
    .withMessage('Tag ID must be a positive integer');

// Public routes
// GET /user-follow-tags/tag/:tagId - Get all users following a tag
router
    .route('/user-follow-tags/tag/:tagId')
    .get(tagIdParam, validate, UserFollowTagController.readUsersByTagId);

// GET /user-follow-tags/tag/:tagId/count - Get follower count for a tag
router
    .route('/user-follow-tags/tag/:tagId/count')
    .get(tagIdParam, validate, UserFollowTagController.readFollowerCountByTagId);

// Protected routes (authentication required)
// GET /user-follow-tags/user/:userId - Get all tags a user follows
router
    .route('/user-follow-tags/user/:userId')
    .get(authenticateToken, userIdParam, validate, UserFollowTagController.readTagsByUserId);

// GET /user-follow-tags/user/:userId/count - Get following count for a user
router
    .route('/user-follow-tags/user/:userId/count')
    .get(authenticateToken, userIdParam, validate, UserFollowTagController.readFollowingCountByUserId);

// GET /user-follow-tags/user/:userId/tag/:tagId - Check if user follows tag
router
    .route('/user-follow-tags/user/:userId/tag/:tagId')
    .get(authenticateToken, userIdParam, tagIdParam, validate, UserFollowTagController.readByUserAndTag);

// POST /user-follow-tags - Create a follow relationship (user follows tag)
router
    .route('/user-follow-tags')
    .post(authenticateToken, userIdBody, tagIdBody, validate, UserFollowTagController.createFollow);

// DELETE /user-follow-tags/user/:userId/tag/:tagId - Delete a follow relationship (unfollow)
router
    .route('/user-follow-tags/user/:userId/tag/:tagId')
    .delete(authenticateToken, userIdParam, tagIdParam, validate, UserFollowTagController.deleteFollow);

export default router;


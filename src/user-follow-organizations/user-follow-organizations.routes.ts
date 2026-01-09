import { Router } from 'express';
import * as UserFollowOrganizationController from './user-follow-organizations.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { param, body } from 'express-validator';
import { validate, commonValidations } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const userIdParam = param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer');

const organizationIdParam = param('organizationId')
    .isInt({ min: 1 })
    .withMessage('Organization ID must be a positive integer');

const userIdBody = body('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer');

const organizationIdBody = body('organizationId')
    .isInt({ min: 1 })
    .withMessage('Organization ID must be a positive integer');

// Public routes
// GET /user-follow-organizations/organization/:organizationId - Get all users following an organization
router
    .route('/user-follow-organizations/organization/:organizationId')
    .get(organizationIdParam, validate, UserFollowOrganizationController.readUsersByOrganizationId);

// GET /user-follow-organizations/organization/:organizationId/count - Get follower count for an organization
router
    .route('/user-follow-organizations/organization/:organizationId/count')
    .get(organizationIdParam, validate, UserFollowOrganizationController.readFollowerCountByOrganizationId);

// Protected routes (authentication required)
// GET /user-follow-organizations/user/:userId - Get all organizations a user follows
router
    .route('/user-follow-organizations/user/:userId')
    .get(authenticateToken, userIdParam, validate, UserFollowOrganizationController.readOrganizationsByUserId);

// GET /user-follow-organizations/user/:userId/count - Get following count for a user
router
    .route('/user-follow-organizations/user/:userId/count')
    .get(authenticateToken, userIdParam, validate, UserFollowOrganizationController.readFollowingCountByUserId);

// GET /user-follow-organizations/user/:userId/organization/:organizationId - Check if user follows organization
router
    .route('/user-follow-organizations/user/:userId/organization/:organizationId')
    .get(authenticateToken, userIdParam, organizationIdParam, validate, UserFollowOrganizationController.readByUserAndOrganization);

// POST /user-follow-organizations - Create a follow relationship (user follows organization)
router
    .route('/user-follow-organizations')
    .post(authenticateToken, userIdBody, organizationIdBody, validate, UserFollowOrganizationController.createFollow);

// DELETE /user-follow-organizations/user/:userId/organization/:organizationId - Delete a follow relationship (unfollow)
router
    .route('/user-follow-organizations/user/:userId/organization/:organizationId')
    .delete(authenticateToken, userIdParam, organizationIdParam, validate, UserFollowOrganizationController.deleteFollow);

export default router;


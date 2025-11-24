import { Router } from 'express';
import * as SignupsController from './signups.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (authentication required)
// GET /signups - Retrieve all signups (Admin only)
router.
    route('/signups').
    get(authenticateToken, requireAdmin, SignupsController.readSignups);

// GET /signups/user/:userId - Retrieve all signups for a specific user
router.
    route('/signups/user/:userId').
    get(authenticateToken, SignupsController.readSignupsByUserId);

// GET /signups/event/:eventId - Retrieve all signups for a specific event
router.
    route('/signups/event/:eventId').
    get(authenticateToken, SignupsController.readSignupsByEventId);

// POST /signups - Register a user for an event
router.
    route('/signups').
    post(authenticateToken, SignupsController.createSignup);

// DELETE /signups/:signupId - De-register a user from an event
router.
    route('/signups/:signupId').
    delete(authenticateToken, SignupsController.deleteSignup);

export default router;

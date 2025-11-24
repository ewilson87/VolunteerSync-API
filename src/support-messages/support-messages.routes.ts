import { Router } from 'express';
import * as SupportMessagesController from './support-messages.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (authentication required)
// GET /support-messages - Retrieve all support messages
router.
    route('/support-messages').
    get(authenticateToken, SupportMessagesController.readSupportMessages);

// GET /support-messages/:messageId - Retrieve a support message by ID
router.
    route('/support-messages/:messageId').
    get(authenticateToken, SupportMessagesController.readSupportMessageById);

// POST /support-messages - Create a new support message
router.
    route('/support-messages').
    post(authenticateToken, SupportMessagesController.createSupportMessage);

// Public route (no authentication required)
// PUT /support-messages/:messageId - Update an existing support message
router.
    route('/support-messages/:messageId').
    put(SupportMessagesController.updateSupportMessage);

// Protected route (authentication required)
// DELETE /support-messages/:messageId - Delete a support message
router.
    route('/support-messages/:messageId').
    delete(authenticateToken, SupportMessagesController.deleteSupportMessage);

export default router;


import { Router } from 'express';
import * as MetricsController from './metrics.controller';
import { authenticateToken, requireVolunteer, requireOrganizerOrAdmin, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Volunteer metrics endpoint
// GET /api/metrics/volunteer/summary - Get volunteer metrics summary (Volunteer only)
router
    .route('/volunteer/summary')
    .get(authenticateToken, requireVolunteer, MetricsController.getVolunteerSummary);

// Organizer metrics endpoint
// GET /api/metrics/organizer/summary - Get organizer metrics summary (Organizer or Admin)
// Query parameter: organizationId (optional, required for admin, ignored for organizer)
router
    .route('/organizer/summary')
    .get(authenticateToken, requireOrganizerOrAdmin, MetricsController.getOrganizerSummary);

// Admin metrics endpoint
// GET /api/metrics/admin/summary - Get admin metrics summary (Admin only)
router
    .route('/admin/summary')
    .get(authenticateToken, requireAdmin, MetricsController.getAdminSummary);

export default router;


import { Router } from 'express';
import * as OrganizationsController from './organizations.controller';
import { authenticateToken, requireOrganizerOrAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes (no authentication required)
// GET /organizations - Retrieve all organizations
router.
    route('/organizations').
    get(OrganizationsController.readOrganizations);

// GET /organizations/:organizationId - Retrieve a specific organization by ID
router.
    route('/organizations/:organizationId').
    get(OrganizationsController.readOrganizationById);

// GET /organizations/name/:name - Retrieve a specific organization by name
router.
    route('/organizations/name/:name').
    get(OrganizationsController.readOrganizationByName);

// Protected routes
// POST /organizations - Create a new organization (Organizer for organization or Admin only)
router.
    route('/organizations').
    post(authenticateToken, requireOrganizerOrAdmin, OrganizationsController.createOrganization);

// PUT /organizations - Update an existing organization (Organizer for organization or Admin only)
router.
    route('/organizations').
    put(authenticateToken, requireOrganizerOrAdmin, OrganizationsController.updateOrganization);

// DELETE /organizations/:organizationId - Delete an organization (Organizer for organization or Admin only)
router.
    route('/organizations/:organizationId').
    delete(authenticateToken, requireOrganizerOrAdmin, OrganizationsController.deleteOrganization);

export default router;

import { Request, RequestHandler, Response } from 'express';
import { OkPacket } from 'mysql';
import * as OrganizationsDao from './organizations.dao';
import * as UsersDao from '../users/users.dao';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { recordAuditEvent } from '../services/audit.service';

/**
 * Retrieves all organizations from the database.
 * 
 * @route GET /organizations
 * @access Public
 * @returns {Promise<void>} JSON array of all organizations
 */
export const readOrganizations: RequestHandler = async (req: Request, res: Response) => {
    try {
        const organizations = await OrganizationsDao.readOrganizations();
        res.status(200).json(organizations);
    } catch (error) {
        console.error('[organizations.controller][readOrganizations][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching organizations'
        });
    }
};

/**
 * Retrieves a specific organization by ID.
 * 
 * @route GET /organizations/:organizationId
 * @access Public
 * @param {number} req.params.organizationId - The ID of the organization to retrieve
 * @returns {Promise<void>} JSON array containing organization data
 */
export const readOrganizationById: RequestHandler = async (req: Request, res: Response) => {
    try {
        const organizationId = parseInt(req.params.organizationId);
        const organization = await OrganizationsDao.readOrganizationById(organizationId);
        res.status(200).json(organization);
    } catch (error) {
        console.error('[organizations.controller][readOrganizationById][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching the organization'
        });
    }
};

/**
 * Retrieves an organization by name.
 * 
 * @route GET /organizations/name/:name
 * @access Public
 * @param {string} req.params.name - The name of the organization to retrieve
 * @returns {Promise<void>} JSON object containing organization data
 */
export const readOrganizationByName: RequestHandler = async (req: Request, res: Response) => {
    try {
        const name = req.params.name;
        const organization = await OrganizationsDao.readOrganizationByName(name);

        if (!organization || organization.length === 0) {
            res.status(404).json({
                message: 'Organization not found'
            });
            return;
        }

        res.status(200).json(organization[0]);
    } catch (error) {
        console.error('[organizations.controller][readOrganizationByName][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching the organization'
        });
    }
};

/**
 * Creates a new organization.
 * Optionally links a user to the organization and sets their role to 'organizer'.
 * 
 * @route POST /organizations
 * @access Private (Organizer or Admin)
 * @param {Object} req.body - Organization data
 * @param {number} [req.body.userId] - Optional user ID to link to the organization
 * @returns {Promise<void>} JSON object with creation result and optional user link info
 */
export const createOrganization: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { userId, ...organizationData } = req.body;

        const okPacket: OkPacket = await OrganizationsDao.createOrganization(organizationData);

        if (userId) {
            try {
                const organizationId = okPacket.insertId;
                const user = await UsersDao.readUserById(userId);

                if (user && user.length > 0) {
                    const userData = user[0];
                    userData.organizationId = organizationId;
                    if (userData.role !== 'organizer') {
                        userData.role = 'organizer';
                    }

                    await UsersDao.updateUser(userData);

                    res.status(201).json({
                        organization: okPacket,
                        userLinked: true,
                        userId,
                        organizationId
                    });
                    return;
                }
            } catch (linkError) {
                console.error('[organizations.controller][createOrganization][LinkUserError] ', linkError);
            }
        }

        res.status(201).json({
            ...okPacket,
            organizationId: okPacket.insertId
        });
    } catch (error: any) {
        console.error('[organizations.controller][createOrganization][Error] ', error);

        // Handle duplicate organization name error
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({
                message: 'An organization with this name already exists',
                errors: {
                    name: ['An organization with this name already exists']
                }
            });
            return;
        }

        res.status(500).json({
            message: 'There was an error creating the organization'
        });
    }
};

/**
 * Updates an existing organization.
 * Regular fields can be updated by organizers or admins.
 * Approval status fields can only be updated by admins.
 * 
 * @route PUT /organizations
 * @access Private (Organizer for organization or Admin)
 * @param {number} req.body.organizationId - The ID of the organization to update
 * @param {Object} req.body - Updated organization data
 * @param {string} [req.body.approvalStatus] - New approval status (admin only)
 * @param {string} [req.body.rejectionReason] - Rejection reason if status is 'rejected' (admin only)
 * @returns {Promise<void>} JSON object with update result
 */
export const updateOrganization: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const authenticatedUser = req.user;
        const organizationData = req.body;

        const approvalFields = ['approvalStatus', 'approvedBy', 'approvedAt', 'rejectionReason'];
        const hasApprovalFields = approvalFields.some(field => organizationData.hasOwnProperty(field));

        if (hasApprovalFields) {
            if (!authenticatedUser || authenticatedUser.role !== 'admin') {
                res.status(403).json({
                    message: 'Only administrators can update approval status'
                });
                return;
            }

            const {
                approvalStatus,
                rejectionReason,
                approvedBy,
                approvedAt,
                ...regularFields
            } = organizationData;

            const regularFieldKeys = Object.keys(regularFields).filter(key => key !== 'organizationId');
            if (regularFieldKeys.length > 0) {
                await OrganizationsDao.updateOrganization({
                    ...regularFields,
                    organizationId: organizationData.organizationId
                });
            }

            const adminUserId = authenticatedUser.userId;
            const approvalTimestamp = approvalStatus === 'approved' || approvalStatus === 'rejected'
                ? new Date()
                : null;

            const finalRejectionReason = approvalStatus === 'approved' || approvalStatus === 'pending'
                ? null
                : (rejectionReason || null);

            const okPacket: OkPacket = await OrganizationsDao.updateApprovalStatus(
                organizationData.organizationId,
                approvalStatus,
                adminUserId,
                approvalTimestamp,
                finalRejectionReason
            );

            // Record audit event for organization approval/rejection
            await recordAuditEvent({
                userId: adminUserId,
                actionType: approvalStatus === 'approved' ? 'approve' : approvalStatus === 'rejected' ? 'reject' : 'update',
                entityType: 'organization',
                entityId: organizationData.organizationId,
                details: {
                    approvalStatus: approvalStatus,
                    rejectionReason: finalRejectionReason,
                    organizationName: organizationData.name || 'Unknown'
                },
                ipAddress: req.ip
            });

            res.status(200).json(okPacket);
            return;
        }

        const okPacket: OkPacket = await OrganizationsDao.updateOrganization(organizationData);
        res.status(200).json(okPacket);
    } catch (error: any) {
        console.error('[organizations.controller][updateOrganization][Error] ', error);

        // Handle duplicate organization name error
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({
                message: 'An organization with this name already exists',
                errors: {
                    name: ['An organization with this name already exists']
                }
            });
            return;
        }

        res.status(500).json({
            message: 'There was an error updating the organization'
        });
    }
};

/**
 * Deletes an organization from the database.
 * 
 * @route DELETE /organizations/:organizationId
 * @access Private (Organizer for organization or Admin)
 * @param {number} req.params.organizationId - The ID of the organization to delete
 * @returns {Promise<void>} JSON object with deletion result
 */
export const deleteOrganization: RequestHandler = async (req: Request, res: Response) => {
    try {
        const organizationId = parseInt(req.params.organizationId);
        const response = await OrganizationsDao.deleteOrganization(organizationId);
        res.status(200).json(response);
    } catch (error) {
        console.error('[organizations.controller][deleteOrganization][Error] ', error);
        res.status(500).json({
            message: 'There was an error deleting the organization'
        });
    }
};

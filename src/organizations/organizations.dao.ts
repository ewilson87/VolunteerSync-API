import { OkPacket } from 'mysql';
import { execute } from '../services/mysql.connector';
import { Organization } from './organizations.model';
import { organizationQueries } from './organizations.queries';

/**
 * Retrieves all organizations from the database.
 * @returns {Promise<Organization[]>} Array of all organization objects
 */
export const readOrganizations = async () => {
    return execute<Organization[]>(organizationQueries.readOrganizations, []);
};

/**
 * Retrieves a specific organization by its ID.
 * @param {number} organizationId - The unique identifier of the organization
 * @returns {Promise<Organization[]>} Array containing the organization object (or empty array if not found)
 */
export const readOrganizationById = async (organizationId: number) => {
    return execute<Organization[]>(organizationQueries.readOrganizationById, [organizationId]);
};

/**
 * Retrieves a specific organization by its name.
 * @param {string} name - The name of the organization
 * @returns {Promise<Organization[]>} Array containing the organization object (or empty array if not found)
 */
export const readOrganizationByName = async (name: string) => {
    return execute<Organization[]>(organizationQueries.readOrganizationByName, [name]);
};

/**
 * Creates a new organization in the database.
 * Approval status defaults to 'pending'.
 * @param {Organization} organization - Organization object containing all required fields
 * @returns {Promise<OkPacket>} MySQL result packet with insertId
 */
export const createOrganization = async (organization: Organization) => {
    return execute<OkPacket>(organizationQueries.createOrganization, [
        organization.name, organization.description, organization.contactEmail,
        organization.contactPhone, organization.website
    ]);
};

/**
 * Updates an existing organization's regular fields (name, description, contact info, website).
 * Does not update approval status fields.
 * @param {Organization} organization - Organization object with updated fields (must include organizationId)
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const updateOrganization = async (organization: Organization) => {
    return execute<OkPacket>(organizationQueries.updateOrganization, [
        organization.name, organization.description, organization.contactEmail,
        organization.contactPhone, organization.website, organization.organizationId
    ]);
};

/**
 * Updates an organization's approval status and related fields.
 * Admin-only operation.
 * @param {number} organizationId - The unique identifier of the organization
 * @param {string} approvalStatus - New approval status ('pending', 'approved', or 'rejected')
 * @param {number | null} approvedBy - ID of the admin user approving/rejecting
 * @param {Date | null} approvedAt - Timestamp of approval/rejection
 * @param {string | null} rejectionReason - Reason for rejection (null if approved or pending)
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const updateApprovalStatus = async (
    organizationId: number,
    approvalStatus: 'pending' | 'approved' | 'rejected',
    approvedBy: number | null,
    approvedAt: Date | null,
    rejectionReason: string | null
) => {
    return execute<OkPacket>(organizationQueries.updateApprovalStatus, [
        approvalStatus,
        approvedBy,
        approvedAt,
        rejectionReason,
        organizationId
    ]);
};

/**
 * Deletes an organization from the database.
 * @param {number} organizationId - The unique identifier of the organization to delete
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteOrganization = async (organizationId: number) => {
    return execute<OkPacket>(organizationQueries.deleteOrganization, [organizationId]);
};

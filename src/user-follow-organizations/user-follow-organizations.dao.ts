import { OkPacket } from 'mysql';
import { execute } from '../services/mysql.connector';
import { UserFollowOrganization } from './user-follow-organizations.model';
import { userFollowOrganizationQueries } from './user-follow-organizations.queries';

/**
 * Retrieves all organizations that a user follows.
 * @param {number} userId - The unique identifier of the user
 * @returns {Promise<any[]>} Array of organizations the user follows
 */
export const readOrganizationsByUserId = async (userId: number) => {
    return execute<any[]>(userFollowOrganizationQueries.readOrganizationsByUserId, [userId]);
};

/**
 * Retrieves all users that follow a specific organization.
 * @param {number} organizationId - The unique identifier of the organization
 * @returns {Promise<any[]>} Array of users following the organization
 */
export const readUsersByOrganizationId = async (organizationId: number) => {
    return execute<any[]>(userFollowOrganizationQueries.readUsersByOrganizationId, [organizationId]);
};

/**
 * Checks if a user follows a specific organization.
 * @param {number} userId - The unique identifier of the user
 * @param {number} organizationId - The unique identifier of the organization
 * @returns {Promise<UserFollowOrganization[]>} Array containing the relationship if it exists (or empty array)
 */
export const readByUserAndOrganization = async (userId: number, organizationId: number) => {
    return execute<UserFollowOrganization[]>(userFollowOrganizationQueries.readByUserAndOrganization, [userId, organizationId]);
};

/**
 * Gets the count of followers for an organization.
 * @param {number} organizationId - The unique identifier of the organization
 * @returns {Promise<{ followerCount: number }[]>} Array with follower count
 */
export const readFollowerCountByOrganizationId = async (organizationId: number) => {
    return execute<{ followerCount: number }[]>(userFollowOrganizationQueries.readFollowerCountByOrganizationId, [organizationId]);
};

/**
 * Gets the count of organizations a user follows.
 * @param {number} userId - The unique identifier of the user
 * @returns {Promise<{ followingCount: number }[]>} Array with following count
 */
export const readFollowingCountByUserId = async (userId: number) => {
    return execute<{ followingCount: number }[]>(userFollowOrganizationQueries.readFollowingCountByUserId, [userId]);
};

/**
 * Creates a new follow relationship (user follows organization).
 * @param {number} userId - The unique identifier of the user
 * @param {number} organizationId - The unique identifier of the organization
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const createFollow = async (userId: number, organizationId: number) => {
    return execute<OkPacket>(userFollowOrganizationQueries.createFollow, [userId, organizationId]);
};

/**
 * Updates the followed_at timestamp for an existing follow relationship.
 * @param {number} userId - The unique identifier of the user
 * @param {number} organizationId - The unique identifier of the organization
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const updateFollowedAt = async (userId: number, organizationId: number) => {
    return execute<OkPacket>(userFollowOrganizationQueries.updateFollowedAt, [userId, organizationId]);
};

/**
 * Deletes a follow relationship (user unfollows organization).
 * @param {number} userId - The unique identifier of the user
 * @param {number} organizationId - The unique identifier of the organization
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteFollow = async (userId: number, organizationId: number) => {
    return execute<OkPacket>(userFollowOrganizationQueries.deleteFollow, [userId, organizationId]);
};

/**
 * Deletes all follow relationships for a user.
 * @param {number} userId - The unique identifier of the user
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteAllByUserId = async (userId: number) => {
    return execute<OkPacket>(userFollowOrganizationQueries.deleteAllByUserId, [userId]);
};

/**
 * Deletes all follow relationships for an organization.
 * @param {number} organizationId - The unique identifier of the organization
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteAllByOrganizationId = async (organizationId: number) => {
    return execute<OkPacket>(userFollowOrganizationQueries.deleteAllByOrganizationId, [organizationId]);
};


import { OkPacket } from 'mysql';
import { execute } from '../services/mysql.connector';
import { UserFollowTag } from './user-follow-tags.model';
import { userFollowTagQueries } from './user-follow-tags.queries';

/**
 * Retrieves all tags that a user follows.
 * @param {number} userId - The unique identifier of the user
 * @returns {Promise<any[]>} Array of tags the user follows
 */
export const readTagsByUserId = async (userId: number) => {
    return execute<any[]>(userFollowTagQueries.readTagsByUserId, [userId]);
};

/**
 * Retrieves all users that follow a specific tag.
 * @param {number} tagId - The unique identifier of the tag
 * @returns {Promise<any[]>} Array of users following the tag
 */
export const readUsersByTagId = async (tagId: number) => {
    return execute<any[]>(userFollowTagQueries.readUsersByTagId, [tagId]);
};

/**
 * Checks if a user follows a specific tag.
 * @param {number} userId - The unique identifier of the user
 * @param {number} tagId - The unique identifier of the tag
 * @returns {Promise<UserFollowTag[]>} Array containing the relationship if it exists (or empty array)
 */
export const readByUserAndTag = async (userId: number, tagId: number) => {
    return execute<UserFollowTag[]>(userFollowTagQueries.readByUserAndTag, [userId, tagId]);
};

/**
 * Gets the count of followers for a tag.
 * @param {number} tagId - The unique identifier of the tag
 * @returns {Promise<{ followerCount: number }[]>} Array with follower count
 */
export const readFollowerCountByTagId = async (tagId: number) => {
    return execute<{ followerCount: number }[]>(userFollowTagQueries.readFollowerCountByTagId, [tagId]);
};

/**
 * Gets the count of tags a user follows.
 * @param {number} userId - The unique identifier of the user
 * @returns {Promise<{ followingCount: number }[]>} Array with following count
 */
export const readFollowingCountByUserId = async (userId: number) => {
    return execute<{ followingCount: number }[]>(userFollowTagQueries.readFollowingCountByUserId, [userId]);
};

/**
 * Creates a new follow relationship (user follows tag).
 * @param {number} userId - The unique identifier of the user
 * @param {number} tagId - The unique identifier of the tag
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const createFollow = async (userId: number, tagId: number) => {
    return execute<OkPacket>(userFollowTagQueries.createFollow, [userId, tagId]);
};

/**
 * Updates the followed_at timestamp for an existing follow relationship.
 * @param {number} userId - The unique identifier of the user
 * @param {number} tagId - The unique identifier of the tag
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const updateFollowedAt = async (userId: number, tagId: number) => {
    return execute<OkPacket>(userFollowTagQueries.updateFollowedAt, [userId, tagId]);
};

/**
 * Deletes a follow relationship (user unfollows tag).
 * @param {number} userId - The unique identifier of the user
 * @param {number} tagId - The unique identifier of the tag
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteFollow = async (userId: number, tagId: number) => {
    return execute<OkPacket>(userFollowTagQueries.deleteFollow, [userId, tagId]);
};

/**
 * Deletes all follow relationships for a user.
 * @param {number} userId - The unique identifier of the user
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteAllByUserId = async (userId: number) => {
    return execute<OkPacket>(userFollowTagQueries.deleteAllByUserId, [userId]);
};

/**
 * Deletes all follow relationships for a tag.
 * @param {number} tagId - The unique identifier of the tag
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteAllByTagId = async (tagId: number) => {
    return execute<OkPacket>(userFollowTagQueries.deleteAllByTagId, [tagId]);
};


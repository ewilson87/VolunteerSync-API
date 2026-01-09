import { OkPacket } from 'mysql';
import { execute } from '../services/mysql.connector';
import { User } from './users.model';
import { userQueries } from './users.queries';

/**
 * Retrieves all users from the database.
 * @returns {Promise<User[]>} Array of all user objects
 */
export const readUsers = async () => {
    return execute<User[]>(userQueries.readUsers, []);
};

/**
 * Retrieves a specific user by their ID.
 * @param {number} userId - The unique identifier of the user
 * @returns {Promise<User[]>} Array containing the user object (or empty array if not found)
 */
export const readUserById = async (userId: number) => {
    return execute<User[]>(userQueries.readUserById, [userId]);
};

/**
 * Retrieves a user by their email address (case-insensitive).
 * @param {string} email - The email address to search for
 * @returns {Promise<User[]>} Array containing the user object (or empty array if not found)
 */
export const readUserByEmail = async (email: string) => {
    return execute<User[]>(userQueries.readUserByEmail, [email]);
};

/**
 * Creates a new user in the database.
 * @param {User} user - User object containing all required fields (passwordHash must be pre-hashed)
 * @returns {Promise<OkPacket>} MySQL result packet with insertId
 */
export const createUser = async (user: User) => {
    return execute<OkPacket>(userQueries.createUser, [
        user.firstName, user.lastName, user.email, user.passwordHash, user.role, user.organizationId || null
    ]);
};

/**
 * Updates an existing user's information in the database.
 * @param {User} user - User object with updated fields (must include userId)
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const updateUser = async (user: User) => {
    return execute<OkPacket>(userQueries.updateUser, [
        user.firstName, user.lastName, user.email, user.passwordHash, user.role, user.organizationId || null, user.userId
    ]);
};

/**
 * Deletes a user from the database.
 * @param {number} userId - The unique identifier of the user to delete
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteUser = async (userId: number) => {
    return execute<OkPacket>(userQueries.deleteUser, [userId]);
};

/**
 * Updates a user's last_login timestamp to the current time.
 * @param {number} userId - The unique identifier of the user
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const updateLastLogin = async (userId: number) => {
    return execute<OkPacket>(userQueries.updateLastLogin, [userId]);
};

/**
 * Counts the number of admin users in the database.
 * @returns {Promise<{ adminCount: number }[]>} Array with admin count
 */
export const countAdminUsers = async () => {
    return execute<{ adminCount: number }[]>(userQueries.countAdminUsers, []);
};

/**
 * Retrieves users by organization_id (limited fields: firstName, lastName, email).
 * @param {number} organizationId - The unique identifier of the organization
 * @returns {Promise<{ firstName: string; lastName: string; email: string }[]>} Array of user objects with limited fields
 */
export const readUsersByOrganizationId = async (organizationId: number) => {
    return execute<{ firstName: string; lastName: string; email: string }[]>(userQueries.readUsersByOrganizationId, [organizationId]);
};
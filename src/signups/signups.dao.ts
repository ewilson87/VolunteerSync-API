import { OkPacket } from 'mysql';
import { execute } from '../services/mysql.connector';
import { Signup } from './signups.model';
import { signupQueries } from './signups.queries';

/**
 * Retrieves all signups from the database.
 * @returns {Promise<Signup[]>} Array of all signup objects
 */
export const readSignups = async () => {
    return execute<Signup[]>(signupQueries.readSignups, []);
};

/**
 * Retrieves all signups for a specific user.
 * @param {number} userId - The unique identifier of the user
 * @returns {Promise<Signup[]>} Array of signup objects for the user
 */
export const readSignupsByUserId = async (userId: number) => {
    return execute<Signup[]>(signupQueries.readSignupsByUserId, [userId]);
};

/**
 * Retrieves all signups for a specific event.
 * @param {number} eventId - The unique identifier of the event
 * @returns {Promise<Signup[]>} Array of signup objects for the event
 */
export const readSignupsByEventId = async (eventId: number) => {
    return execute<Signup[]>(signupQueries.readSignupsByEventId, [eventId]);
};

/**
 * Retrieves a specific signup by its ID.
 * @param {number} signupId - The unique identifier of the signup
 * @returns {Promise<Signup>} Signup object (or undefined if not found)
 */
export const readSignupById = async (signupId: number) => {
    return execute<Signup[]>(signupQueries.readSignupById, [signupId])
        .then(signups => signups[0]);
};

/**
 * Creates a new signup record (registers a user for an event).
 * @param {Signup} signup - Signup object containing userId and eventId
 * @returns {Promise<OkPacket>} MySQL result packet with insertId
 */
export const createSignup = async (signup: Signup) => {
    return execute<OkPacket>(signupQueries.createSignup, [
        signup.userId, signup.eventId
    ]);
};

/**
 * Deletes a signup record (de-registers a user from an event).
 * @param {number} signupId - The unique identifier of the signup to delete
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteSignup = async (signupId: number) => {
    return execute<OkPacket>(signupQueries.deleteSignup, [signupId]);
};

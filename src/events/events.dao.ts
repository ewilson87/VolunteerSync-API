import { OkPacket } from 'mysql';
import { execute } from '../services/mysql.connector';
import { Event } from './events.model';
import { eventQueries } from './events.queries';

/**
 * Retrieves all events from the database.
 * @returns {Promise<Event[]>} Array of all event objects
 */
export const readEvents = async () => {
    return execute<Event[]>(eventQueries.readEvents, []);
};

/**
 * Retrieves a specific event by its ID.
 * @param {number} eventId - The unique identifier of the event
 * @returns {Promise<Event[]>} Array containing the event object (or empty array if not found)
 */
export const readEventById = async (eventId: number) => {
    return execute<Event[]>(eventQueries.readEventById, [eventId]);
};

/**
 * Searches events by optional filters (city, state, date, organization).
 * @param {string} [city] - City to filter by
 * @param {string} [state] - State to filter by (2-letter code)
 * @param {string} [date] - Date to filter by (ISO 8601 format)
 * @param {number} [organizationId] - Organization ID to filter by
 * @returns {Promise<Event[]>} Array of matching event objects
 */
export const searchEvents = async (city?: string, state?: string, date?: string, organizationId?: number) => {
    return execute<Event[]>(eventQueries.searchEvents, [
        city || null,
        state || null,
        date || null,
        organizationId || null
    ]);
};

/**
 * Creates a new event in the database.
 * @param {Event} event - Event object containing all required fields
 * @returns {Promise<OkPacket>} MySQL result packet with insertId
 */
export const createEvent = async (event: Event) => {
    return execute<OkPacket>(eventQueries.createEvent, [
        event.title, event.description, event.eventDate, event.eventTime, event.eventLengthHours,
        event.locationName, event.address, event.city, event.state,
        event.numNeeded, event.numSignedUp, event.createdBy, event.organizationId
    ]);
};

/**
 * Updates an existing event in the database.
 * @param {Event} event - Event object with updated fields (must include eventId)
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const updateEvent = async (event: Event) => {
    return execute<OkPacket>(eventQueries.updateEvent, [
        event.title, event.description, event.eventDate, event.eventTime, event.eventLengthHours,
        event.locationName, event.address, event.city, event.state,
        event.numNeeded, event.numSignedUp, event.createdBy, event.organizationId, event.eventId
    ]);
};

/**
 * Deletes an event from the database.
 * @param {number} eventId - The unique identifier of the event to delete
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteEvent = async (eventId: number) => {
    return execute<OkPacket>(eventQueries.deleteEvent, [eventId]);
};

/**
 * Increments the signup count for an event.
 * @param {number} eventId - The unique identifier of the event
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const incrementSignupCount = async (eventId: number) => {
    return execute<OkPacket>(eventQueries.incrementSignupCount, [eventId]);
};

/**
 * Decrements the signup count for an event (prevents negative values).
 * @param {number} eventId - The unique identifier of the event
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const decrementSignupCount = async (eventId: number) => {
    return execute<OkPacket>(eventQueries.decrementSignupCount, [eventId]);
};

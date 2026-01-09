import { OkPacket } from 'mysql';
import { execute } from '../services/mysql.connector';
import { EventTag } from './event-tags.model';
import { eventTagQueries } from './event-tags.queries';

/**
 * Retrieves all tags for a specific event.
 * @param {number} eventId - The unique identifier of the event
 * @returns {Promise<any[]>} Array of tags for the event
 */
export const readTagsByEventId = async (eventId: number) => {
    return execute<any[]>(eventTagQueries.readTagsByEventId, [eventId]);
};

/**
 * Retrieves all events for a specific tag.
 * @param {number} tagId - The unique identifier of the tag
 * @returns {Promise<any[]>} Array of events for the tag
 */
export const readEventsByTagId = async (tagId: number) => {
    return execute<any[]>(eventTagQueries.readEventsByTagId, [tagId]);
};

/**
 * Checks if an event has a specific tag.
 * @param {number} eventId - The unique identifier of the event
 * @param {number} tagId - The unique identifier of the tag
 * @returns {Promise<EventTag[]>} Array containing the relationship if it exists (or empty array)
 */
export const readByEventAndTag = async (eventId: number, tagId: number) => {
    return execute<EventTag[]>(eventTagQueries.readByEventAndTag, [eventId, tagId]);
};

/**
 * Gets the count of tags for an event.
 * @param {number} eventId - The unique identifier of the event
 * @returns {Promise<{ tagCount: number }[]>} Array with tag count
 */
export const readTagCountByEventId = async (eventId: number) => {
    return execute<{ tagCount: number }[]>(eventTagQueries.readTagCountByEventId, [eventId]);
};

/**
 * Gets the count of events for a tag.
 * @param {number} tagId - The unique identifier of the tag
 * @returns {Promise<{ eventCount: number }[]>} Array with event count
 */
export const readEventCountByTagId = async (tagId: number) => {
    return execute<{ eventCount: number }[]>(eventTagQueries.readEventCountByTagId, [tagId]);
};

/**
 * Creates a new event-tag relationship (adds tag to event).
 * @param {number} eventId - The unique identifier of the event
 * @param {number} tagId - The unique identifier of the tag
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const createEventTag = async (eventId: number, tagId: number) => {
    return execute<OkPacket>(eventTagQueries.createEventTag, [eventId, tagId]);
};

/**
 * Deletes an event-tag relationship (removes tag from event).
 * @param {number} eventId - The unique identifier of the event
 * @param {number} tagId - The unique identifier of the tag
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteEventTag = async (eventId: number, tagId: number) => {
    return execute<OkPacket>(eventTagQueries.deleteEventTag, [eventId, tagId]);
};

/**
 * Deletes all tag relationships for an event.
 * @param {number} eventId - The unique identifier of the event
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteAllByEventId = async (eventId: number) => {
    return execute<OkPacket>(eventTagQueries.deleteAllByEventId, [eventId]);
};

/**
 * Deletes all event relationships for a tag.
 * @param {number} tagId - The unique identifier of the tag
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteAllByTagId = async (tagId: number) => {
    return execute<OkPacket>(eventTagQueries.deleteAllByTagId, [tagId]);
};


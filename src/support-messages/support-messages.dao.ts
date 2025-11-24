import { OkPacket } from 'mysql';
import { execute } from '../services/mysql.connector';
import { SupportMessage } from './support-messages.model';
import { supportMessageQueries } from './support-messages.queries';

/**
 * Retrieves all support messages from the database.
 * @returns {Promise<SupportMessage[]>} Array of all support message objects
 */
export const readSupportMessages = async () => {
    return execute<SupportMessage[]>(supportMessageQueries.readSupportMessages, []);
};

/**
 * Retrieves a specific support message by its ID.
 * @param {number} messageId - The unique identifier of the support message
 * @returns {Promise<SupportMessage>} Support message object (or undefined if not found)
 */
export const readSupportMessageById = async (messageId: number) => {
    return execute<SupportMessage[]>(supportMessageQueries.readSupportMessageById, [messageId])
        .then(messages => messages[0]);
};

/**
 * Creates a new support message in the database.
 * @param {SupportMessage} message - Support message object containing all required fields
 * @returns {Promise<OkPacket>} MySQL result packet with insertId
 */
export const createSupportMessage = async (message: SupportMessage) => {
    return execute<OkPacket>(supportMessageQueries.createSupportMessage, [
        message.userId ?? null,
        message.name,
        message.email,
        message.subject,
        message.message,
        message.isResolved ?? 0,
        message.respondedBy ?? null,
        message.responseMessage ?? null,
        message.respondedAt ?? null
    ]);
};

/**
 * Updates an existing support message in the database.
 * @param {SupportMessage} message - Support message object with updated fields (must include messageId)
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const updateSupportMessage = async (message: SupportMessage) => {
    return execute<OkPacket>(supportMessageQueries.updateSupportMessage, [
        message.userId ?? null,
        message.name,
        message.email,
        message.subject,
        message.message,
        message.isResolved ?? 0,
        message.respondedBy ?? null,
        message.responseMessage ?? null,
        message.respondedAt ?? null,
        message.messageId
    ]);
};

/**
 * Deletes a support message from the database.
 * @param {number} messageId - The unique identifier of the support message to delete
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteSupportMessage = async (messageId: number) => {
    return execute<OkPacket>(supportMessageQueries.deleteSupportMessage, [messageId]);
};


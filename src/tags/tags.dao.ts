import { OkPacket } from 'mysql';
import { execute } from '../services/mysql.connector';
import { Tag } from './tags.model';
import { tagQueries } from './tags.queries';

/**
 * Retrieves all tags from the database.
 * @returns {Promise<Tag[]>} Array of all tag objects
 */
export const readTags = async () => {
    return execute<Tag[]>(tagQueries.readTags, []);
};

/**
 * Retrieves a specific tag by its ID.
 * @param {number} tagId - The unique identifier of the tag
 * @returns {Promise<Tag[]>} Array containing the tag object (or empty array if not found)
 */
export const readTagById = async (tagId: number) => {
    return execute<Tag[]>(tagQueries.readTagById, [tagId]);
};

/**
 * Retrieves a specific tag by its name.
 * @param {string} name - The name of the tag
 * @returns {Promise<Tag[]>} Array containing the tag object (or empty array if not found)
 */
export const readTagByName = async (name: string) => {
    return execute<Tag[]>(tagQueries.readTagByName, [name]);
};

/**
 * Creates a new tag in the database.
 * @param {Tag} tag - Tag object containing the name
 * @returns {Promise<OkPacket>} MySQL result packet with insertId
 */
export const createTag = async (tag: Tag) => {
    return execute<OkPacket>(tagQueries.createTag, [tag.name]);
};

/**
 * Updates an existing tag.
 * @param {Tag} tag - Tag object with updated fields (must include tagId)
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const updateTag = async (tag: Tag) => {
    return execute<OkPacket>(tagQueries.updateTag, [tag.name, tag.tagId]);
};

/**
 * Deletes a tag from the database.
 * @param {number} tagId - The unique identifier of the tag to delete
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteTag = async (tagId: number) => {
    return execute<OkPacket>(tagQueries.deleteTag, [tagId]);
};


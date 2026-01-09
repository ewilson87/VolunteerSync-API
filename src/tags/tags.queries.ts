export const tagQueries = {
    /**
     * Get all tags
     */
    readTags: `
        SELECT
            tag_id AS tagId,
            name
        FROM volunteersync.tags
        ORDER BY name ASC
    `,

    /**
     * Get a specific tag by ID
     */
    readTagById: `
        SELECT
            tag_id AS tagId,
            name
        FROM volunteersync.tags
        WHERE tag_id = ?
    `,

    /**
     * Get a specific tag by name
     */
    readTagByName: `
        SELECT
            tag_id AS tagId,
            name
        FROM volunteersync.tags
        WHERE name = ?
    `,

    /**
     * Create a new tag
     */
    createTag: `
        INSERT INTO volunteersync.tags (name)
        VALUES (?)
    `,

    /**
     * Update an existing tag
     */
    updateTag: `
        UPDATE volunteersync.tags
        SET name = ?
        WHERE tag_id = ?
    `,

    /**
     * Delete a tag
     */
    deleteTag: `
        DELETE FROM volunteersync.tags
        WHERE tag_id = ?
    `
};


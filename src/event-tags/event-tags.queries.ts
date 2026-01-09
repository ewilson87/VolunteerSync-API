export const eventTagQueries = {
    /**
     * Get all tags for a specific event
     */
    readTagsByEventId: `
        SELECT
            et.event_id AS eventId,
            et.tag_id AS tagId,
            t.name AS tagName
        FROM volunteersync.event_tags et
        INNER JOIN volunteersync.tags t ON et.tag_id = t.tag_id
        WHERE et.event_id = ?
        ORDER BY t.name ASC
    `,

    /**
     * Get all events for a specific tag
     */
    readEventsByTagId: `
        SELECT
            et.event_id AS eventId,
            et.tag_id AS tagId,
            e.title AS eventTitle,
            e.description AS eventDescription,
            e.event_date AS eventDate,
            e.event_time AS eventTime,
            e.city AS eventCity,
            e.state AS eventState
        FROM volunteersync.event_tags et
        INNER JOIN volunteersync.events e ON et.event_id = e.event_id
        WHERE et.tag_id = ?
        ORDER BY e.event_date DESC, e.event_time ASC
    `,

    /**
     * Check if an event has a specific tag
     */
    readByEventAndTag: `
        SELECT
            event_id AS eventId,
            tag_id AS tagId
        FROM volunteersync.event_tags
        WHERE event_id = ? AND tag_id = ?
    `,

    /**
     * Get count of tags for an event
     */
    readTagCountByEventId: `
        SELECT COUNT(*) AS tagCount
        FROM volunteersync.event_tags
        WHERE event_id = ?
    `,

    /**
     * Get count of events for a tag
     */
    readEventCountByTagId: `
        SELECT COUNT(*) AS eventCount
        FROM volunteersync.event_tags
        WHERE tag_id = ?
    `,

    /**
     * Create a new event-tag relationship (add tag to event)
     */
    createEventTag: `
        INSERT INTO volunteersync.event_tags 
            (event_id, tag_id)
        VALUES (?, ?)
    `,

    /**
     * Delete an event-tag relationship (remove tag from event)
     */
    deleteEventTag: `
        DELETE FROM volunteersync.event_tags
        WHERE event_id = ? AND tag_id = ?
    `,

    /**
     * Delete all tags for an event (when event is deleted)
     */
    deleteAllByEventId: `
        DELETE FROM volunteersync.event_tags
        WHERE event_id = ?
    `,

    /**
     * Delete all events for a tag (when tag is deleted)
     */
    deleteAllByTagId: `
        DELETE FROM volunteersync.event_tags
        WHERE tag_id = ?
    `
};


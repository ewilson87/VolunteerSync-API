/**
 * Interface representing an event-tag relationship.
 * This is a junction table for the many-to-many relationship between events and tags.
 */
export interface EventTag {
    eventId: number;
    tagId: number;
}


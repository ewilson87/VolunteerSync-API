/**
 * Interface representing a user following a tag relationship.
 * This is a junction table for the many-to-many relationship between users and tags.
 */
export interface UserFollowTag {
    userId: number;
    tagId: number;
    followedAt?: Date | null;
}


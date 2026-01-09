/**
 * Interface representing a user following an organization relationship.
 * This is a junction table for the many-to-many relationship between users and organizations.
 */
export interface UserFollowOrganization {
    userId: number;
    organizationId: number;
    followedAt?: Date | null;
}


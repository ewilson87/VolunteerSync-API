export const userQueries = {
    // Query to fetch all users
    readUsers: `
        SELECT 
            user_id AS userId, first_name AS firstName, last_name AS lastName, 
            email, password_hash AS passwordHash, role, 
            last_login AS lastLogin, created_at AS createdAt, updated_at AS updatedAt, organization_id AS organizationId 
        FROM volunteersync.users
    `,

    // Query to fetch a specific user by ID
    readUserById: `
        SELECT 
            user_id AS userId, first_name AS firstName, last_name AS lastName, 
            email, password_hash AS passwordHash, role, 
            last_login AS lastLogin, created_at AS createdAt, updated_at AS updatedAt, organization_id AS organizationId
        FROM volunteersync.users
        WHERE user_id = ?
    `,

    readUserByEmail: `
        SELECT 
            user_id AS userId, first_name AS firstName, last_name AS lastName, 
            email, password_hash AS passwordHash, role, 
            last_login AS lastLogin, created_at AS createdAt, updated_at AS updatedAt, organization_id AS organizationId
        FROM volunteersync.users
        WHERE LOWER(email) = LOWER(?)
    `,

    // Query to insert a new user
    createUser: `
        INSERT INTO volunteersync.users 
            (first_name, last_name, email, password_hash, role, organization_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `,

    // Query to update an existing user
    updateUser: `
        UPDATE volunteersync.users
        SET first_name = ?, last_name = ?, email = ?, password_hash = ?, role = ?, organization_id = ?, updated_at = NOW()
        WHERE user_id = ?
    `,

    // Query to delete a user
    deleteUser: `
        DELETE FROM volunteersync.users
        WHERE user_id = ?
    `,

    // Query to update user's last login timestamp
    updateLastLogin: `
        UPDATE volunteersync.users
        SET last_login = NOW()
        WHERE user_id = ?
    `,

    // Query to count admin users
    countAdminUsers: `
        SELECT COUNT(*) AS adminCount
        FROM volunteersync.users
        WHERE role = 'admin'
    `,

    // Query to fetch users by organization_id (limited fields for organizers)
    readUsersByOrganizationId: `
        SELECT 
            first_name AS firstName,
            last_name AS lastName,
            email
        FROM volunteersync.users
        WHERE organization_id = ?
        ORDER BY first_name ASC, last_name ASC
    `
};

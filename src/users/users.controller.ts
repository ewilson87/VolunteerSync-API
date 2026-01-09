import { Request, RequestHandler, Response } from 'express';
import { User } from './users.model';
import * as UsersDao from './users.dao';
import { OkPacket } from 'mysql';
import * as OrganizationsDao from '../organizations/organizations.dao';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import crypto from 'crypto';
import { recordAuditEvent } from '../services/audit.service';
import logger from '../services/logger.service';

/**
 * Retrieves all users from the database.
 * Requires admin authentication.
 * 
 * @route GET /users
 * @access Private (Admin only)
 * @returns {Promise<void>} JSON array of all users
 */
export const readUsers: RequestHandler = async (req: Request, res: Response) => {
    try {
        const users = await UsersDao.readUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('[users.controller][readUsers][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching users'
        });
    }
};

/**
 * Retrieves a specific user by ID.
 * Organizers can only view limited data (userId, firstName, lastName, email) for other users.
 * Users can view their own full data, admins can view any user's full data.
 * 
 * @route GET /users/:userId
 * @access Private (User viewing own data, Organizer viewing any user, or Admin)
 * @param {number} req.params.userId - The ID of the user to retrieve
 * @returns {Promise<void>} JSON object containing user data
 */
export const readUserById: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = parseInt(req.params.userId as string);
        if (Number.isNaN(userId)) throw new Error("Invalid user ID");

        const user = await UsersDao.readUserById(userId);

        if (!user || user.length === 0) {
            res.status(404).json({
                message: 'User not found'
            });
            return;
        }

        const userData = user[0];
        const authenticatedUser = req.user;

        if (authenticatedUser &&
            authenticatedUser.role === 'organizer' &&
            authenticatedUser.userId !== userId) {
            const limitedUserData = {
                userId: userData.userId,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email
            };
            res.status(200).json([limitedUserData]);
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('[users.controller][readUserById][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching the user'
        });
    }
};

/**
 * Retrieves a user by email address.
 * Admin only endpoint, primarily used for administrative purposes.
 * 
 * @route GET /users/email/:email
 * @access Private (Admin only)
 * @param {string} req.params.email - The email address of the user to retrieve
 * @returns {Promise<void>} JSON object containing user data
 */
export const readUserByEmail: RequestHandler = async (req: Request, res: Response) => {
    try {
        const email = req.params.email;
        const user = await UsersDao.readUserByEmail(email);
        res.status(200).json(user);
    } catch (error) {
        console.error('[users.controller][readUserByEmail][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching the user by email'
        });
    }
};

/**
 * Creates a new user account (registration).
 * Passwords are hashed using bcrypt before storage.
 * 
 * @route POST /users/register
 * @access Public
 * @param {string} req.body.firstName - User's first name
 * @param {string} req.body.lastName - User's last name
 * @param {string} req.body.email - User's email address (must be unique)
 * @param {string} req.body.password - Plain text password (will be hashed)
 * @param {string} req.body.role - User role (volunteer, organizer, or admin)
 * @param {number} [req.body.organizationId] - Optional organization ID
 * @returns {Promise<void>} JSON object with created user data
 */
export const createUser: RequestHandler = async (req: Request, res: Response) => {
    try {
        const plainPassword = req.body.password;
        if (!plainPassword) {
            res.status(400).json({
                message: 'Password is required',
                errors: {
                    password: ['Password is required']
                }
            });
            return;
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

        const userData: User = {
            ...req.body,
            passwordHash: passwordHash
        };

        delete (userData as any).password;

        const okPacket: OkPacket = await UsersDao.createUser(userData);
        res.status(201).json(okPacket);
    } catch (error: any) {
        console.error('[users.controller][createUser][Error] ', error);

        // Handle duplicate email error
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({
                message: 'A user with this email already exists',
                errors: {
                    email: ['A user with this email already exists']
                }
            });
            return;
        }

        res.status(500).json({
            message: 'There was an error creating the user'
        });
    }
};

/**
 * Updates an existing user's information.
 * Users can only update their own profile unless they are an admin.
 * If a password is provided, it will be hashed before storage.
 * 
 * @route PUT /users
 * @access Private (User updating own data or Admin)
 * @param {number} req.body.userId - The ID of the user to update
 * @param {string} [req.body.firstName] - Updated first name
 * @param {string} [req.body.lastName] - Updated last name
 * @param {string} [req.body.email] - Updated email address
 * @param {string} [req.body.password] - New password (will be hashed)
 * @param {string} [req.body.role] - Updated role
 * @param {number} [req.body.organizationId] - Updated organization ID
 * @returns {Promise<void>} JSON object with update result
 */
export const updateUser: RequestHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const authenticatedUser = req.user;

        if (!authenticatedUser) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        // Determine userId - can come from body.userId or body.email (for organizers)
        let userIdToUpdate: number | undefined = req.body.userId;
        const emailToUpdate = req.body.email;
        const isAdmin = authenticatedUser.role === 'admin';
        const isOrganizer = authenticatedUser.role === 'organizer';

        // If organizer is using email instead of userId, look up the user by email
        if (isOrganizer && !userIdToUpdate && emailToUpdate) {
            const usersByEmail = await UsersDao.readUserByEmail(emailToUpdate);
            if (!usersByEmail || usersByEmail.length === 0) {
                res.status(404).json({
                    message: 'User not found'
                });
                return;
            }
            userIdToUpdate = usersByEmail[0].userId;
        }

        // Validate that we have a userId at this point
        if (!userIdToUpdate) {
            res.status(400).json({
                message: 'Either userId or email must be provided'
            });
            return;
        }

        // Get current user data to check permissions and validate changes
        const currentUser = await UsersDao.readUserById(userIdToUpdate);
        if (!currentUser || currentUser.length === 0) {
            res.status(404).json({
                message: 'User not found'
            });
            return;
        }

        const currentUserData = currentUser[0];
        const isSelfUpdate = authenticatedUser.userId === userIdToUpdate;

        // Permission check: Users can update themselves, admins can update anyone, organizers have limited permissions
        if (!isSelfUpdate && !isAdmin && !isOrganizer) {
            res.status(403).json({
                message: 'You can only update your own profile unless you are an admin or organizer'
            });
            return;
        }

        // Organizer-specific restrictions: can only promote volunteers to organizers and set organization_id
        if (isOrganizer && !isSelfUpdate) {
            // Organizers can only change role from volunteer to organizer
            const newRole = req.body.role;
            if (newRole && newRole !== currentUserData.role) {
                if (currentUserData.role !== 'volunteer' || newRole !== 'organizer') {
                    res.status(403).json({
                        message: 'Organizers can only promote volunteers to organizer role'
                    });
                    return;
                }
            }

            // Organizers can only set organization_id to their own organization
            const newOrganizationId = req.body.organizationId;
            if (newOrganizationId !== undefined && newOrganizationId !== authenticatedUser.organizationId) {
                res.status(403).json({
                    message: 'Organizers can only assign users to their own organization'
                });
                return;
            }

            // Organizers cannot change any other fields (preserve existing values)
            const userData: User = {
                userId: userIdToUpdate,
                firstName: currentUserData.firstName,
                lastName: currentUserData.lastName,
                email: currentUserData.email,
                passwordHash: currentUserData.passwordHash,
                role: newRole || currentUserData.role,
                organizationId: newOrganizationId !== undefined ? newOrganizationId : currentUserData.organizationId
            };

            const okPacket: OkPacket = await UsersDao.updateUser(userData);

            // Record audit event for organizer promoting user
            await recordAuditEvent({
                userId: authenticatedUser.userId,
                actionType: 'update',
                entityType: 'user',
                entityId: userIdToUpdate,
                details: {
                    updatedUserId: userIdToUpdate,
                    oldRole: currentUserData.role,
                    newRole: userData.role,
                    oldOrganizationId: currentUserData.organizationId,
                    newOrganizationId: userData.organizationId,
                    updatedUserEmail: currentUserData.email,
                    actionBy: 'organizer'
                },
                ipAddress: req.ip
            });

            res.status(200).json(okPacket);
            return;
        }

        // Admin and self-update logic (full update allowed)
        if (!isSelfUpdate && !isAdmin) {
            res.status(403).json({
                message: 'You can only update your own profile unless you are an admin'
            });
            return;
        }

        const newRole = req.body.role;

        // Protection: Cannot change role of the only remaining admin
        if (currentUserData.role === 'admin' && newRole && newRole !== 'admin') {
            const adminCountResult = await UsersDao.countAdminUsers();
            const adminCount = adminCountResult && adminCountResult.length > 0 ? adminCountResult[0].adminCount : 0;

            if (adminCount <= 1) {
                res.status(403).json({
                    message: 'Cannot change the role of the only remaining admin account. At least one admin must exist.'
                });
                return;
            }
        }

        const userData: User = { ...req.body };

        if (req.body.password) {
            const plainPassword = req.body.password;
            const saltRounds = 10;
            userData.passwordHash = await bcrypt.hash(plainPassword, saltRounds);
            delete (userData as any).password;
        }

        const okPacket: OkPacket = await UsersDao.updateUser(userData);

        // Record audit event if role was changed by admin
        if (isAdmin && newRole && newRole !== currentUserData.role) {
            await recordAuditEvent({
                userId: authenticatedUser.userId,
                actionType: 'update',
                entityType: 'user',
                entityId: userIdToUpdate,
                details: {
                    updatedUserId: userIdToUpdate,
                    oldRole: currentUserData.role,
                    newRole: newRole,
                    updatedUserEmail: currentUserData.email
                },
                ipAddress: req.ip
            });
        }

        res.status(200).json(okPacket);
    } catch (error: any) {
        console.error('[users.controller][updateUser][Error] ', error);

        // Handle duplicate email error
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({
                message: 'A user with this email already exists'
            });
            return;
        }

        res.status(500).json({
            message: 'There was an error updating the user'
        });
    }
};

/**
 * Deletes a user from the database.
 * If the user is an organizer with an associated organization, the organization is also deleted.
 * 
 * @route DELETE /users/:userId
 * @access Private (Admin only)
 * @param {number} req.params.userId - The ID of the user to delete
 * @returns {Promise<void>} JSON object with deletion result
 */
export const deleteUser: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const authenticatedUser = req.user;
        const userId = parseInt(req.params.userId);

        if (!authenticatedUser) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        // Protection: Admin cannot delete their own account
        if (authenticatedUser.userId === userId) {
            res.status(403).json({
                message: 'You cannot delete your own account'
            });
            return;
        }

        const user = await UsersDao.readUserById(userId);

        if (!user || user.length === 0) {
            res.status(404).json({
                message: 'User not found'
            });
            return;
        }

        const userData = user[0];

        // Protection: Cannot delete the only remaining admin
        if (userData.role === 'admin') {
            const adminCountResult = await UsersDao.countAdminUsers();
            const adminCount = adminCountResult && adminCountResult.length > 0 ? adminCountResult[0].adminCount : 0;

            if (adminCount <= 1) {
                res.status(403).json({
                    message: 'Cannot delete the only remaining admin account. At least one admin must exist.'
                });
                return;
            }
        }

        if (userData.role === 'organizer' && userData.organizationId) {
            await OrganizationsDao.deleteOrganization(userData.organizationId);
            console.log(`Organization ${userData.organizationId} deleted as part of user ${userId} deletion`);
        }

        const response = await UsersDao.deleteUser(userId);

        // Record audit event
        await recordAuditEvent({
            userId: authenticatedUser.userId,
            actionType: 'delete',
            entityType: 'user',
            entityId: userId,
            details: {
                deletedUserId: userId,
                deletedUserEmail: userData.email,
                deletedUserRole: userData.role
            },
            ipAddress: req.ip
        });

        res.status(200).json(response);
    } catch (error) {
        console.error('[users.controller][deleteUser][Error] ', error);
        res.status(500).json({
            message: 'There was an error deleting the user'
        });
    }
};

/**
 * Authenticates a user and returns a JWT token.
 * Supports both bcrypt and SHA-256 password hashes for backward compatibility.
 * Handles Gmail email normalization (dots in local part are ignored).
 * Updates the user's last_login timestamp on successful authentication.
 * 
 * @route POST /users/login
 * @access Public
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's plain text password
 * @returns {Promise<void>} JSON object containing JWT token and user information
 */
export const login: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                message: 'Email and password are required'
            });
            return;
        }

        const normalizeGmailEmail = (email: string): string => {
            if (email.includes('@gmail.com')) {
                const [localPart, domain] = email.toLowerCase().split('@');
                const normalizedLocal = localPart.replace(/\./g, '');
                return `${normalizedLocal}@${domain}`;
            }
            return email.toLowerCase();
        };

        let users = await UsersDao.readUserByEmail(email);

        if ((!users || users.length === 0) && email.includes('@gmail.com')) {
            const normalizedEmail = normalizeGmailEmail(email);
            try {
                const allUsers = await UsersDao.readUsers();
                users = allUsers.filter(u =>
                    u.email.includes('@gmail.com') && normalizeGmailEmail(u.email) === normalizedEmail
                );

                if (users.length > 0) {
                    console.log(`[users.controller][login] Found user with Gmail normalization: ${email} -> ${users[0].email}`);
                }
            } catch (error) {
                console.error('[users.controller][login] Error fetching all users for Gmail normalization:', error);
            }
        }

        if (!users || users.length === 0) {
            res.status(401).json({
                message: 'Invalid email or password'
            });
            return;
        }

        const user = users[0];

        let isPasswordValid = false;

        if (user.passwordHash.startsWith('$2')) {
            isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        } else {
            const hash = crypto.createHash('sha256').update(password).digest('hex');
            isPasswordValid = hash === user.passwordHash;
        }

        if (!isPasswordValid) {
            res.status(401).json({
                message: 'Invalid email or password'
            });
            return;
        }

        await UsersDao.updateLastLogin(user.userId);

        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const token = jwt.sign(
            {
                userId: user.userId,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
            },
            jwtSecret,
            { expiresIn: '24h' }
        );

        // Record audit event for successful login
        await recordAuditEvent({
            userId: user.userId,
            actionType: 'login',
            entityType: 'auth',
            details: {
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
            },
            ipAddress: req.ip
        });

        res.status(200).json({
            token,
            user: {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
            }
        });
    } catch (error) {
        console.error('[users.controller][login][Error] ', error);
        res.status(500).json({
            message: 'There was an error during login'
        });
    }
};

/**
 * Links a user to an organization and sets them as an organizer.
 * If the user is not already an organizer, their role is updated to 'organizer'.
 * 
 * @route POST /users/:userId/link-organization
 * @access Private (Admin only)
 * @param {number} req.params.userId - The ID of the user to link
 * @param {number} req.body.organizationId - The ID of the organization to link the user to
 * @returns {Promise<void>} JSON object confirming the link operation
 */
export const linkUserToOrganization: RequestHandler = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId);
        const { organizationId } = req.body;

        if (!organizationId) {
            res.status(400).json({
                message: 'Organization ID is required'
            });
            return;
        }

        const user = await UsersDao.readUserById(userId);

        if (!user || user.length === 0) {
            res.status(404).json({
                message: 'User not found'
            });
            return;
        }

        const organization = await OrganizationsDao.readOrganizationById(organizationId);

        if (!organization || organization.length === 0) {
            res.status(404).json({
                message: 'Organization not found'
            });
            return;
        }

        const userData = user[0];
        userData.organizationId = organizationId;

        if (userData.role !== 'organizer') {
            userData.role = 'organizer';
        }

        const response = await UsersDao.updateUser(userData);

        res.status(200).json({
            message: 'User successfully linked to organization',
            userId,
            organizationId,
            response
        });
    } catch (error) {
        console.error('[users.controller][linkUserToOrganization][Error] ', error);
        res.status(500).json({
            message: 'There was an error linking the user to the organization'
        });
    }
};

/**
 * Retrieves a list of users in the same organization as the authenticated organizer.
 * Returns only firstName, lastName, and email for privacy.
 * 
 * @route GET /users/organization/members
 * @access Private (Organizer or Admin)
 * @returns {Promise<void>} JSON array of users with limited fields
 */
export const readOrganizationMembers: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const authenticatedUser = req.user;

        if (!authenticatedUser) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        const isAdmin = authenticatedUser.role === 'admin';
        const isOrganizer = authenticatedUser.role === 'organizer';

        if (!isAdmin && !isOrganizer) {
            res.status(403).json({
                message: 'Only organizers and admins can view organization members'
            });
            return;
        }

        // Determine which organizationId to use
        let organizationId: number | null = null;

        if (isAdmin) {
            // Admins can optionally specify an organizationId via query parameter
            // If not provided and admin has an organizationId, use that
            // Otherwise, require the query parameter
            const orgIdParam = req.query.organizationId;
            if (orgIdParam) {
                organizationId = parseInt(orgIdParam as string);
                if (isNaN(organizationId) || organizationId <= 0) {
                    res.status(400).json({
                        message: 'organizationId must be a positive integer'
                    });
                    return;
                }
            } else if (authenticatedUser.organizationId) {
                organizationId = authenticatedUser.organizationId;
            } else {
                res.status(400).json({
                    message: 'organizationId query parameter is required for admins without an organization'
                });
                return;
            }
        } else if (isOrganizer) {
            // Organizers use their own organizationId from token
            if (!authenticatedUser.organizationId) {
                res.status(400).json({
                    message: 'User is not associated with an organization'
                });
                return;
            }
            organizationId = authenticatedUser.organizationId;
        }

        const members = await UsersDao.readUsersByOrganizationId(organizationId);

        logger.info('Retrieved organization members', {
            requestId: (req as any).requestId,
            organizationId,
            count: members.length,
            requestedBy: authenticatedUser.userId
        });

        res.status(200).json(members);
    } catch (error) {
        const requestId = (req as any).requestId;
        logger.error('Error fetching organization members', {
            requestId,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({
            message: 'There was an error fetching organization members'
        });
    }
};

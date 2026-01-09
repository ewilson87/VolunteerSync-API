import { Router } from 'express';
import * as UsersController from './users.controller';
import { authenticateToken, requireAdmin, requireUserOrAdmin, requireOrganizerOrAdmin } from '../middleware/auth.middleware';
import { authLimiter, registerLimiter } from '../middleware/rate-limit.middleware';
import { commonValidations, validate } from '../middleware/validation.middleware';

const router = Router();

router.
    route('/users/login').
    post(
        authLimiter,
        commonValidations.email,
        commonValidations.passwordLogin,
        validate,
        UsersController.login
    );

router.
    route('/users/register').
    post(
        registerLimiter,
        commonValidations.firstName,
        commonValidations.lastName,
        commonValidations.email,
        commonValidations.password,
        commonValidations.role,
        validate,
        UsersController.createUser
    );

router.
    route('/users').
    get(authenticateToken, requireAdmin, UsersController.readUsers);

router.
    route('/users/:userId').
    get(authenticateToken, requireUserOrAdmin, UsersController.readUserById);

router.
    route('/users/email/:email').
    get(authenticateToken, requireAdmin, UsersController.readUserByEmail);

router.
    route('/users').
    put(
        authenticateToken,
        commonValidations.passwordOptional,
        validate,
        UsersController.updateUser
    );

router.
    route('/users/:userId').
    delete(authenticateToken, requireAdmin, UsersController.deleteUser);

router.
    route('/users/:userId/link-organization').
    post(authenticateToken, requireAdmin, UsersController.linkUserToOrganization);

router.
    route('/users/organization/members').
    get(authenticateToken, requireOrganizerOrAdmin, UsersController.readOrganizationMembers);

export default router;

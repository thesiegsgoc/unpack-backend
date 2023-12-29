import express, { Request, Response, Router, NextFunction } from 'express';
import * as UserControllers from "../controllers/userController";

const router: Router = express.Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Retrieves a list of all users
 *     description: This endpoint retrieves all registered users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *
 * @route GET /api/users
 * @description Retrieves a list of all users
 * @access Public
 * @returns {Array<User>} 200 - An array of user objects
 */
router.get('/api/users', UserControllers.getAllUsersController);

/**
 * @route POST /api/users
 * @description Registers a new user
 * @access Public
 * @param {string} name - Name of the user
 * @param {string} email - Email of the user
 * @param {string} password - Password for the user account
 * @returns {Object} 201 - The created user object
 */
router.post('/api/users', UserControllers.registerUserController);

/**
 * @route PUT /api/users/:id
 * @description Updates the information of a specific user
 * @access Private
 * @param {string} id - Unique identifier of the user
 * @returns {Object} 200 - The updated user object
 */
router.put('/api/users/:id', UserControllers.updateUserInfoController);

/**
 * @route DELETE /api/users/:id
 * @description Deletes a user by ID
 * @access Private
 * @param {string} id - Unique identifier of the user to delete
 * @returns {Object} 200 - Success message
 */
router.delete('/api/users/:id', UserControllers.deleteUserController);

/**
 * @route GET /api/users/:id
 * @description Retrieves a specific user by ID
 * @access Public
 * @param {string} id - Unique identifier of the user
 * @returns {Object<User>} 200 - A user object
 */
router.get('/api/users/:id', UserControllers.getUserByIdController);

export default router;

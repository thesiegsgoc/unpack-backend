"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserControllers = __importStar(require("../controllers/userController"));
const router = express_1.default.Router();
/**
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
router.post('/api/users/register', UserControllers.registerUserController);
router.post('/api/users/login', UserControllers.loginUserController);
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
exports.default = router;

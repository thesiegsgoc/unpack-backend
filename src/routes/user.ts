import express, { Request, Response, Router, NextFunction } from 'express';
import * as UserControllers from "../controllers/userController";

const router: Router = express.Router();

//Get all users
router.get('/api/users', UserControllers.getAllUsersController);

// Register a new user
router.post('/api/users', UserControllers.registerUserController);

// Update user information
router.put('/api/users/:id', UserControllers.updateUserInfoController);

//Delete user by ID
router.delete('/api/users/:id', UserControllers.deleteUserController);

//Get user by ID 
router.get('/api/users/:id', UserControllers.getUserByIdController);

// Remove duplicate default export statement
// export default router;








export default router;
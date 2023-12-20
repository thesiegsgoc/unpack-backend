import { Request, Response, NextFunction } from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import UserModel from '../models/User';
import { IUser } from "../types/user";
import config from '../config';

const { JWT_SECRET_CODE } = config;

// Extend the Express Request type to include the user field
interface RequestWithUser extends Request {
    user?: IUser;
}

interface DecodedToken extends JwtPayload {
    userId: string;
}

/**
 * Middleware function to check if the user is authenticated
 * 
 * @param { RequestWithUser } req the request object
 * @param { Response } res the response object
 * @param { NextFunction } next the next middleware function
 * @returns { Promise<void> } void
 */
export const isUserAuth = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (req.headers && req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];

        try {
            const decoded = jwt.verify(token, JWT_SECRET_CODE) as DecodedToken;
            const user = await UserModel.findById(decoded.userId);

            if (!user) {
                return res.status(401).json({ success: false, message: 'User not authorized.' });
            }

            req.user = user;
            next();
        } catch (error: any) {
            return res.status(401).json({ success: false, message: 'User not authorized.', error: error.message });
        }
    } else {
        return res.status(401).json({ success: false, message: 'Authorization token not found.' });
    }
};

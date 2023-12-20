"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const config_1 = __importDefault(require("../config"));
const { JWT_SECRET_CODE } = config_1.default;
/**
 * Middleware function to check if the user is authenticated
 *
 * @param { RequestWithUser } req the request object
 * @param { Response } res the response object
 * @param { NextFunction } next the next middleware function
 * @returns { Promise<void> } void
 */
const isUserAuth = async (req, res, next) => {
    if (req.headers && req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET_CODE);
            const user = await User_1.default.findById(decoded.userId);
            if (!user) {
                return res.status(401).json({ success: false, message: 'User not authorized.' });
            }
            req.user = user;
            next();
        }
        catch (error) {
            return res.status(401).json({ success: false, message: 'User not authorized.', error: error.message });
        }
    }
    else {
        return res.status(401).json({ success: false, message: 'Authorization token not found.' });
    }
};
exports.isUserAuth = isUserAuth;

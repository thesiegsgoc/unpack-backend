"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const isUserAuth = async (req, res, next) => {
    if (req.headers && req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_CODE);
        const user = await User_1.default.findById({ _id: decode.userId });
        if (!user) {
            return res.json({ success: false, message: 'User not authorized.' });
        }
        req.user = user;
        next();
    }
    else {
        return res.json({ success: false, message: 'User not authorized.' });
    }
};
exports.isUserAuth = isUserAuth;

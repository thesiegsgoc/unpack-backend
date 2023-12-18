import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from "../models/User";

interface DecodedToken {
    userId: string;
    // ... other fields if your token has more
}

export const isUserAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers && req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.JWT_SECRET_CODE) as DecodedToken;
        const user = await User.findById({ _id: decode.userId });
        if (!user) {
            return res.json({ success: false, message: 'User not authorized.'});
        }
        req.user = user;
        next();
    } else {
        return res.json({ success: false, message: 'User not authorized.'});
    }
};

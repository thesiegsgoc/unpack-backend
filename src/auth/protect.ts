import { Request, Response, NextFunction } from 'express';

export const protectRoute = (req: Request, res: Response, next: NextFunction): void => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

export const allowIf = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/dashboard');
};

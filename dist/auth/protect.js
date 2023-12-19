"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowIf = exports.protectRoute = void 0;
const protectRoute = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};
exports.protectRoute = protectRoute;
const allowIf = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/dashboard');
};
exports.allowIf = allowIf;

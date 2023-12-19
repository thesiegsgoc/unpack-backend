"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginCheck = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const passport_local_1 = require("passport-local");
const User_1 = __importDefault(require("../models/User")); // Make sure this model is compatible with TypeScript
// Assuming User has a specific type or interface, you might need to import that as well
const loginCheck = (passport) => {
    passport.use(new passport_local_1.Strategy({ usernameField: "phone" }, (phone, password, done) => {
        User_1.default.findOne({ phone: phone })
            .then((user) => {
            if (!user) {
                return done(null, false);
            }
            // Match Password
            bcryptjs_1.default.compare(password, user.password, (error, isMatch) => {
                if (error)
                    throw error;
                if (isMatch) {
                    return done(null, user);
                }
                else {
                    return done(null, false);
                }
            });
        })
            .catch((error) => console.log(error));
    }));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User_1.default.findById(id, (error, user) => {
            done(error, user);
        });
    });
};
exports.loginCheck = loginCheck;

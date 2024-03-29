import bcrypt from 'bcryptjs';
import { Strategy as LocalStrategy } from 'passport-local';
import passport from 'passport';
import User from "../models/users/user"; // Make sure this model is compatible with TypeScript


// Assuming User has a specific type or interface, you might need to import that as well
export const loginCheck = (passport: passport.PassportStatic): void => {
    passport.use(
        new LocalStrategy({ usernameField: "phone" }, (phone, password, done) => {
            User.findOne({ phone: phone })
                .then((user: any) => { // Replace 'any' with the actual type of your User model
                    if (!user) {
                        return done(null, false);
                    }
                    // Match Password
                    bcrypt.compare(password, user.password, (error, isMatch) => {
                        if (error) throw error;
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false);
                        }
                    });
                })
                .catch((error: Error) => console.log(error));
        })
    );

    passport.serializeUser((user: any, done) => { // Replace 'any' with the actual type of your User model
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (error: Error, user: any) => { // Replace 'any' with the actual type of your User model
            done(error, user);
        });
    });
};

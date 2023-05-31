const bcrypt = require("bcryptjs");
LocalStrategy = require("passport-local").Strategy;
//Load model
const User = require("../models/User");

module.exports = {
    loginCheck: (passport) => {
        passport.use(
            new LocalStrategy({ usernameField: "phone" }, (phone, password, done) => {
                //Check customer
                User.findOne({ phone: phone })
                    .then((user) => {
                        if (!user) {
                            console.log("wrong phone");
                            return done();
                        }
                        //Match Password
                        bcrypt.compare(password, user.password, (error, isMatch) => {
                            if (error) throw error;
                            if (isMatch) {
                                return done(null, user);
                            } else {
                                console.log("Wrong password");
                                return done();
                            }
                        });
                    })
                    .catch((error) => console.log(error));
            })
        );
        passport.serializeUser((user, done) => {
            done(null, user.id);
        });
        passport.deserializeUser((id, done) => {
            User.findById(id, (error, user) => {
                done(error, user);
            });
        });
    }
};
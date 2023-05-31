const db = require('../util/db');
const jwt = require('jsonwebtoken');
const User = require("../models/User");

module.exports = {
    isUserAuth : async (req, res, next) => {
        if (req.headers && req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const decode = jwt.verify(token, process.env.JWT_SECRET_CODE);
            const user = await User.findById({ _id: decode.userId });
            if (!user) {
                return res.json({ success: false, message: 'User not authorized.'});
            }
            req.user = user;
            next();
        } else {
            return res.json({ success: false, message: 'User not authorized.'});
        }
    }
};
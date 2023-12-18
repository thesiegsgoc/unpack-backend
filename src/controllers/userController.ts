const User = require("../models/User");
const jwt = require('jsonwebtoken');
const db = require('../util/db');
const { v4: uuidv4 } = require('uuid');
const END_NUMBER = 1000000;
const cloudinary = require('../util/cloudinary');
const argon2 = require('argon2');

module.exports = {
    registerUser: async (req, res) => {
        const { username, phone, password, confirm, location, expoPushToken, status, securityCode, securityAnswer } = req.body;

        if (!username || !phone || !password || !confirm || !status) {
            return res.json({ success: false, message: "Fill empty fields" });
        }
        if (password !== confirm) {
            return res.json({ success: false, message: "Password must match" });
        } else {
            try {
                const userPhone = await User.findOne({ phone: phone });
                if (userPhone) {
                    return res.json({ success: false, message: `Cannot register multiple user with the same phone number ${username} is not available.` });
                }
                

                const user = await User.findOne({ username: username });
                if (user) {
                    return res.json({ success: false, message: `${username} is not available. Choose another username.` });
                }

                const userCount = await db.users.countDocuments({});
                    const newUser = new User({
                        userId: `U-${uuidv4()}-${END_NUMBER + userCount + 1}`,
                        username,
                        phone,
                        location,
                        password,
                        status,
                        deliveries: [],
                        expoPushToken,
                        rating: 5.0,
                        profilePhoto: 'https://via.placeholder.com/150',
                        securityAnswer,
                        securityCode
                    });
                    await newUser.save();
                    return res.status(201).send({ success: true, data: newUser });
            } catch (error) {
                return res.json({ success: false, message: error.message });
            }
        }
    },

    loginUser: async (req, res) => {
        const { username, password } = req.body;
        try {
            const user = await User.findOne({ username });
            const isMatch = await user.comparePassword(password);
            if (!user) {
                return res.json({ success: false, error: 'Incorrect username.' });
            }

            if (!isMatch) {
                return res.json({ success: false, error: 'Incorrect password.' });
            }
            const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET_CODE, { expiresIn: '30d' });
            return res.json({
                success: true,
                userID: user._id,
                token,
                expoPushToken: user.expoPushToken,
                profilePhoto: user.profilePhoto,
                username: user.fullname || user.username,
                rating: user.rating || 5.0,
                phone: user.phone,
                email: user.email,
                status: user.status
            });
        } catch (error) {
            return res.json({ success: false, error: error.message });
        }
    },

    uploadProfilePicture: async (req, res) => {
        const { file } = req;
        const userID = JSON.parse(req.body.userID).userID;

        try {
            if (!file) {
                return res.json({
                    success: false,
                    message: 'No profile picture provided.'
                });
            }

            if (!userID) {
                return res.json({
                    success: false,
                    message: 'Cannot update a profile picture of an unknown user.'
                });
            }
            const user = await User.findById({ _id: userID });

            if (!user) {
                return res.json({
                    success: false,
                    message: 'Cannot update a profile picture of an unregistered user.'
                });
            }

            const profilePhotObj = await cloudinary.uploader.upload(
                file.path,
                {
                    public_id: `${user.username}_profile`,
                    width: 500,
                    height: 500,
                    crop: 'fill'
                }
            )
            await User.updateOne(
                {
                    _id: userID
                },
                {
                    $set: {
                        profilePhoto: profilePhotObj.secure_url
                    }
                }
            );
            res.json({
                success: true,
                message: 'Profile picture successfully updated.',
                body: {
                    profileUrl: profilePhotObj.secure_url
                }
            })
        } catch (error) {
            res.json({ success: false, message: error.message })
        }
    },

    updateUserInfo: async (req, res) => {
        const { userId, fullname, phone, email } = req.body;
        try {
            await User.updateOne(
                { _id: userId },
                {
                    $set: {
                        fullname: fullname,
                        phone: phone,
                        email: email
                    }
                }
            );
            return res.json({ success: true, message: 'Partner info has updated successfully.' });
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }
    },

    updateUserLocation: async (req, res) => {
        const { userId, location } = req.body;
        try {
            await User.updateOne(
                { _id: userId },
                {
                    $set: {
                        location: location
                    }
                }
            );
            return res.json({ success: true, message: 'Partner info has updated successfully.' });
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }
    },

    resetUserPassword: async (req, res) => {
        const { phone, password, confirm, securityCode, securityAnswer } = req.body;
        
        if (!securityCode || !phone || !password || !confirm || !securityAnswer ) {
            return res.json({ success: false, message: "Fill empty fields" });
        }

        if (password !== confirm) {
            return res.json({ success: false, message: "Passwords must match" });
        }

        try {
            const user = await User.findOne({ phone: phone });
            if (!user) {
                 return res.json({ success: false, message: "No user with the entered phone number found." });
            }

            if (user.securityCode !== securityCode || user.securityAnswer !== securityAnswer) {
                return res.json({ success: false, message: "Incorrect security code and answer given." });
            }

            const hashedPassword = await argon2.hash(password);
            await User.updateOne({ phone: phone }, {
                $set: {
                    password: hashedPassword
                }
            });
            return res.json({ 
                success: true,
                body: {
                    username: user.username
                },
                message: "Password reset successfully."
            });

        } catch (error) {
            return res.json({ success: false, message: error.message });
        }
    }
};
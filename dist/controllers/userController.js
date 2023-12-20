"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetUserPasswordController = exports.updateUserLocationController = exports.updateUserInfoController = exports.uploadProfilePictureController = exports.loginUserController = exports.registerUserController = void 0;
//Todo: change to import from services
const userService_1 = require("../services/userService");
const END_NUMBER = 1000000;
const registerUserController = async (req, res) => {
    try {
        const { username, phone, password, confirm, location, expoPushToken, status, securityCode, securityAnswer } = req.body;
        if (!username || !phone || !password || !confirm || !status) {
            return res.status(400).json({ success: false, message: "Fill empty fields" });
        }
        if (password !== confirm) {
            return res.status(400).json({ success: false, message: "Password must match" });
        }
        const newUser = await (0, userService_1.userRegisterService)({ username, phone, password, location, expoPushToken, status, securityAnswer, securityCode });
        res.status(201).json({ success: true, data: newUser });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.registerUserController = registerUserController;
const loginUserController = async (req, res) => {
    try {
        const { username, password } = req.body;
        const { token, user } = await (0, userService_1.loginUserService)(username, password);
        res.json({
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
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.loginUserController = loginUserController;
const uploadProfilePictureController = async (req, res) => {
    try {
        //TODO: Add file type for Request 
        //@ts-ignore
        const { file } = req;
        const userID = JSON.parse(req.body.userID).userID;
        if (!file) {
            return res.status(400).json({ success: false, message: 'No profile picture provided.' });
        }
        if (!userID) {
            return res.status(400).json({ success: false, message: 'Cannot update a profile picture of an unknown user.' });
        }
        const profileUrl = await (0, userService_1.uploadProfilePictureService)(userID, file.path);
        res.json({
            success: true,
            message: 'Profile picture successfully updated.',
            body: { profileUrl }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.uploadProfilePictureController = uploadProfilePictureController;
const updateUserInfoController = async (req, res) => {
    try {
        const { userId, fullname, phone, email } = req.body;
        await (0, userService_1.updateUserInfoService)(userId, { fullname, phone, email });
        res.json({ success: true, message: 'User info has updated successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateUserInfoController = updateUserInfoController;
const updateUserLocationController = async (req, res) => {
    try {
        const { userId, location } = req.body;
        await (0, userService_1.updateUserLocationService)(userId, location);
        res.json({ success: true, message: 'User location has been updated successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateUserLocationController = updateUserLocationController;
const resetUserPasswordController = async (req, res) => {
    const { phone, password, confirm, securityCode, securityAnswer } = req.body;
    if (!securityCode || !phone || !password || !confirm || !securityAnswer) {
        return res.status(400).json({ success: false, message: "Fill empty fields" });
    }
    if (password !== confirm) {
        return res.status(400).json({ success: false, message: "Passwords must match" });
    }
    try {
        const username = await (0, userService_1.resetUserPasswordService)(phone, password, securityCode, securityAnswer);
        res.json({ success: true, body: { username }, message: "Password reset successfully." });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.resetUserPasswordController = resetUserPasswordController;

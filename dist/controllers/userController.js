"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByIdController = exports.getAllUsersController = exports.deleteUserController = exports.resetUserPasswordController = exports.updateUserLocationController = exports.updateUserInfoController = exports.uploadProfilePictureController = exports.loginUserController = exports.registerUserController = void 0;
const UserServices = __importStar(require("../services/userService"));
const registerUserController = async (req, res) => {
    try {
        const { fullname, phone, password, location, expoPushToken, status, securityCode, securityAnswer, } = req.body;
        const newUser = await UserServices.userRegisterService({
            fullname,
            phone,
            password,
            location,
            expoPushToken,
            status,
            securityAnswer,
            securityCode,
        });
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
        const { token, user } = await UserServices.loginUserService(username, password);
        res.json({
            success: true,
            userID: user._id,
            token,
            expoPushToken: user.expoPushToken,
            profilePhoto: user.profilePhoto,
            username,
            rating: user.rating || 5.0,
            phone: user.phone,
            email: user.email,
            status: user.status,
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
            return res
                .status(400)
                .json({ success: false, message: 'No profile picture provided.' });
        }
        if (!userID) {
            return res.status(400).json({
                success: false,
                message: 'Cannot update a profile picture of an unknown user.',
            });
        }
        const profileUrl = await UserServices.uploadProfilePictureService(userID, file.path);
        res.json({
            success: true,
            message: 'Profile picture successfully updated.',
            body: { profileUrl },
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
        await UserServices.updateUserInfoService(userId, { fullname, phone, email });
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
        await UserServices.updateUserLocationService(userId, location);
        res.json({
            success: true,
            message: 'User location has been updated successfully.',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateUserLocationController = updateUserLocationController;
const resetUserPasswordController = async (req, res) => {
    const { phone, password, confirm, securityCode, securityAnswer } = req.body;
    if (!securityCode || !phone || !password || !confirm || !securityAnswer) {
        return res
            .status(400)
            .json({ success: false, message: 'Fill empty fields' });
    }
    if (password !== confirm) {
        return res
            .status(400)
            .json({ success: false, message: 'Passwords must match' });
    }
    try {
        const username = await UserServices.resetUserPasswordService(phone, password, securityCode, securityAnswer);
        res.json({
            success: true,
            body: { username },
            message: 'Password reset successfully.',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.resetUserPasswordController = resetUserPasswordController;
const deleteUserController = async (req, res) => {
    try {
        const { userId } = req.body;
        await UserServices.deleteUserService(userId);
        res.json({ success: true, message: 'User has been deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteUserController = deleteUserController;
const getAllUsersController = async (req, res) => {
    try {
        const users = await UserServices.getAllUsersService();
        res.json({ success: true, users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllUsersController = getAllUsersController;
const getUserByIdController = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await UserServices.getUserByIdService(userId);
        if (user) {
            res.json({ success: true, user });
        }
        else {
            res.status(404).json({ success: false, message: 'User not found.' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getUserByIdController = getUserByIdController;

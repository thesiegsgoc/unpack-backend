"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserLocationService = exports.getUserByIdService = exports.getAllUsersService = exports.deleteUserService = exports.resetUserPasswordService = exports.updateUserInfoService = exports.uploadProfilePictureService = exports.loginUserService = exports.userRegisterService = void 0;
const db_1 = __importDefault(require("../util/db"));
const uuid_1 = require("uuid");
const user_1 = __importDefault(require("../models/users/user"));
const cloudinary_1 = __importDefault(require("../util/cloudinary"));
const generateJwtToken_1 = require("../util/generateJwtToken");
const argon2_1 = __importDefault(require("argon2"));
const END_NUMBER = 1000000;
const userRegisterService = async (userData) => {
    const { fullname, phone, password, location, expoPushToken, status, securityAnswer, securityCode, } = userData;
    const existingUser = await user_1.default.findOne({ fullname: fullname });
    if (existingUser) {
        throw new Error('User is already registered. Please login');
    }
    const userCount = await db_1.default.users.countDocuments({});
    const hashedPassword = await argon2_1.default.hash(password);
    const username = fullname?.replace(/\s+/g, '_').toLowerCase();
    const newUser = new user_1.default({
        userId: `U-${(0, uuid_1.v4)()}-${END_NUMBER + userCount + 1}`,
        username: username,
        fullname,
        phone,
        location,
        password: hashedPassword,
        status,
        deliveries: [],
        expoPushToken,
        rating: 5.0,
        profilePhoto: 'https://via.placeholder.com/150',
        securityAnswer,
        securityCode,
    });
    console.log(newUser);
    await newUser.save();
    return newUser;
};
exports.userRegisterService = userRegisterService;
const loginUserService = async (username, password) => {
    const user = await user_1.default.findOne({ username });
    if (!user) {
        throw new Error('Incorrect username.');
    }
    const isPasswordMatch = await argon2_1.default.verify(user.password, password);
    if (!isPasswordMatch) {
        throw new Error('Incorrect password.');
    }
    const token = await (0, generateJwtToken_1.generateJwtToken)(user.userId);
    return {
        token,
        user,
    };
};
exports.loginUserService = loginUserService;
const uploadProfilePictureService = async (userID, filePath) => {
    const user = await user_1.default.findById(userID);
    if (!user) {
        throw new Error('Cannot update a profile picture of an unregistered user.');
    }
    const profilePhotObj = await cloudinary_1.default.uploader.upload(filePath, {
        public_id: `${user.username}_profile`,
        width: 500,
        height: 500,
        crop: 'fill',
    });
    await user_1.default.updateOne({ _id: userID }, { $set: { profilePhoto: profilePhotObj.secure_url } });
    return profilePhotObj.secure_url;
};
exports.uploadProfilePictureService = uploadProfilePictureService;
const updateUserInfoService = async (userId, userInfo) => {
    const { fullname, phone, email } = userInfo;
    await user_1.default.updateOne({ _id: userId }, {
        $set: {
            fullname,
            phone,
            email,
        },
    });
};
exports.updateUserInfoService = updateUserInfoService;
const resetUserPasswordService = async (phone, password, securityCode, securityAnswer) => {
    const user = await user_1.default.findOne({ phone });
    if (!user) {
        throw new Error('No user with the entered phone number found.');
    }
    if (user.securityCode !== securityCode ||
        user.securityAnswer !== securityAnswer) {
        throw new Error('Incorrect security code and answer given.');
    }
    const hashedPassword = await argon2_1.default.hash(password);
    await user_1.default.updateOne({ phone }, { $set: { password: hashedPassword } });
    return user.username;
};
exports.resetUserPasswordService = resetUserPasswordService;
const deleteUserService = async (userId) => {
    const user = await user_1.default.findById(userId);
    if (!user) {
        throw new Error('No user found.');
    }
    await user_1.default.deleteOne({ _id: userId });
};
exports.deleteUserService = deleteUserService;
const getAllUsersService = async () => {
    const users = await user_1.default.find();
    if (!users) {
        throw new Error('No users found.');
    }
    return users;
};
exports.getAllUsersService = getAllUsersService;
const getUserByIdService = async (userId) => {
    const user = await user_1.default.findOne({ userId: userId });
    console.log(user);
    if (!user) {
        throw new Error('No user found.');
    }
    return user;
};
exports.getUserByIdService = getUserByIdService;
//TODO: User send current location
const updateUserLocationService = async (userId, location) => {
    await user_1.default.updateOne({ _id: userId }, {
        $set: { location },
    });
};
exports.updateUserLocationService = updateUserLocationService;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetUserPasswordService = exports.updateUserLocationService = exports.updateUserInfoService = exports.uploadProfilePictureService = exports.loginUserService = exports.userRegisterService = void 0;
const db_1 = __importDefault(require("../util/db"));
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const cloudinary_1 = __importDefault(require("../util/cloudinary"));
const config_1 = __importDefault(require("../config"));
const argon2_1 = __importDefault(require("argon2"));
const { JWT_SECRET_CODE } = config_1.default;
const END_NUMBER = 1000000;
const userRegisterService = async (userData) => {
    const { username, phone, password, location, expoPushToken, status, securityAnswer, securityCode } = userData;
    const userPhone = await User_1.default.findOne({ phone: phone });
    if (userPhone) {
        throw new Error(`Cannot register multiple users with the same phone number ${phone}.`);
    }
    const existingUser = await User_1.default.findOne({ username: username });
    if (existingUser) {
        throw new Error(`${username} is not available. Choose another username.`);
    }
    const userCount = await db_1.default.users.countDocuments({});
    const newUser = new User_1.default({
        userId: `U-${(0, uuid_1.v4)()}-${END_NUMBER + userCount + 1}`,
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
    return newUser;
};
exports.userRegisterService = userRegisterService;
const loginUserService = async (username, password) => {
    const user = await User_1.default.findOne({ username });
    if (!user) {
        throw new Error('Incorrect username.');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Incorrect password.');
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.userId }, JWT_SECRET_CODE, { expiresIn: '30d' });
    return {
        token,
        user
    };
};
exports.loginUserService = loginUserService;
const uploadProfilePictureService = async (userID, filePath) => {
    const user = await User_1.default.findById(userID);
    if (!user) {
        throw new Error('Cannot update a profile picture of an unregistered user.');
    }
    const profilePhotObj = await cloudinary_1.default.uploader.upload(filePath, {
        public_id: `${user.username}_profile`,
        width: 500,
        height: 500,
        crop: 'fill'
    });
    await User_1.default.updateOne({ _id: userID }, { $set: { profilePhoto: profilePhotObj.secure_url } });
    return profilePhotObj.secure_url;
};
exports.uploadProfilePictureService = uploadProfilePictureService;
const updateUserInfoService = async (userId, userInfo) => {
    const { fullname, phone, email } = userInfo;
    await User_1.default.updateOne({ _id: userId }, {
        $set: {
            fullname,
            phone,
            email
        }
    });
};
exports.updateUserInfoService = updateUserInfoService;
const updateUserLocationService = async (userId, location) => {
    await User_1.default.updateOne({ _id: userId }, {
        $set: { location }
    });
};
exports.updateUserLocationService = updateUserLocationService;
const resetUserPasswordService = async (phone, password, securityCode, securityAnswer) => {
    const user = await User_1.default.findOne({ phone });
    if (!user) {
        throw new Error("No user with the entered phone number found.");
    }
    if (user.securityCode !== securityCode || user.securityAnswer !== securityAnswer) {
        throw new Error("Incorrect security code and answer given.");
    }
    const hashedPassword = await argon2_1.default.hash(password);
    await User_1.default.updateOne({ phone }, { $set: { password: hashedPassword } });
    return user.username;
};
exports.resetUserPasswordService = resetUserPasswordService;

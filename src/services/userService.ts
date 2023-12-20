import db from '../util/db';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import UserModel from "../models/User";
import cloudinary from '../util/cloudinary';
import config from "../config";
import argon2 from 'argon2';

const {JWT_SECRET_CODE} = config;

const END_NUMBER = 1000000;



export const userRegisterService = async (userData: { username: string, phone: string, password: string, location: any, expoPushToken: string, status: string, securityAnswer: string, securityCode: string }) => {
    const { username, phone, password, location, expoPushToken, status, securityAnswer, securityCode } = userData;

    const userPhone = await UserModel.findOne({ phone: phone });
    if (userPhone) {
        throw new Error(`Cannot register multiple users with the same phone number ${phone}.`);
    }

    const existingUser = await UserModel.findOne({ username: username });
    if (existingUser) {
        throw new Error(`${username} is not available. Choose another username.`);
    }

    const userCount = await db.users.countDocuments({});
    const newUser = new UserModel({
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
    return newUser;
};


export const loginUserService = async (username: string, password: string) => {
    const user = await UserModel.findOne({ username });

    if (!user) {
        throw new Error('Incorrect username.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Incorrect password.');
    }

    const token = jwt.sign({ userId: user.userId }, JWT_SECRET_CODE, { expiresIn: '30d' });
    return {
        token,
        user
    };
};


export const uploadProfilePictureService = async (userID: string, filePath: string) => {
    const user = await UserModel.findById(userID);

    if (!user) {
        throw new Error('Cannot update a profile picture of an unregistered user.');
    }

    const profilePhotObj = await cloudinary.uploader.upload(
        filePath,
        {
            public_id: `${user.username}_profile`,
            width: 500,
            height: 500,
            crop: 'fill'
        }
    );

    await UserModel.updateOne(
        { _id: userID },
        { $set: { profilePhoto: profilePhotObj.secure_url } }
    );

    return profilePhotObj.secure_url;
};


export const updateUserInfoService = async (userId: string, userInfo: { fullname: string, phone: string, email: string }) => {
    const { fullname, phone, email } = userInfo;
    await UserModel.updateOne(
        { _id: userId },
        {
            $set: {
                fullname,
                phone,
                email
            }
        }
    );
};


export const updateUserLocationService = async (userId: string, location: any) => {
    await UserModel.updateOne(
        { _id: userId },
        {
            $set: { location }
        }
    );
};



export const resetUserPasswordService = async (phone: string, password: string, securityCode: string, securityAnswer: string) => {
    const user = await UserModel.findOne({ phone });

    if (!user) {
        throw new Error("No user with the entered phone number found.");
    }

    if (user.securityCode !== securityCode || user.securityAnswer !== securityAnswer) {
        throw new Error("Incorrect security code and answer given.");
    }

    const hashedPassword = await argon2.hash(password);
    await UserModel.updateOne({ phone }, { $set: { password: hashedPassword } });

    return user.username;
};


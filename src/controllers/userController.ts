import User from "../models/users/user"; // Adjust the import based on your User model's export
import jwt from 'jsonwebtoken';
import db from '../util/db';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../util/cloudinary';
import argon2 from 'argon2';
import { Request, Response } from 'express';
//Todo: change to import from services
import * as UserServices from '../services/userService'

const END_NUMBER = 1000000;

export const registerUserController = async (req: Request, res: Response) => {
    try {
        const { username, phone, password, confirm, location, expoPushToken, status, securityCode, securityAnswer } = req.body;

        if (!username || !phone || !password || !confirm || !status) {
            return res.status(400).json({ success: false, message: "Fill empty fields" });
        }

        if (password !== confirm) {
            return res.status(400).json({ success: false, message: "Password must match" });
        }

        const newUser = await UserServices.userRegisterService({ username, phone, password, location, expoPushToken, status, securityAnswer, securityCode });
        res.status(201).json({ success: true, data: newUser });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const loginUserController = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const { token, user } = await UserServices.loginUserService(username, password);

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
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
};


export const uploadProfilePictureController = async (req: Request, res: Response) => {
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

        const profileUrl = await UserServices.uploadProfilePictureService(userID, file.path);

        res.json({
            success: true,
            message: 'Profile picture successfully updated.',
            body: { profileUrl }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const updateUserInfoController = async (req: Request, res: Response) => {
    try {
        const { userId, fullname, phone, email } = req.body;
        await UserServices.updateUserInfoService(userId, { fullname, phone, email });
        res.json({ success: true, message: 'User info has updated successfully.' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};



export const updateUserLocationController = async (req: Request, res: Response) => {
    try {
        const { userId, location } = req.body;
        await UserServices.updateUserLocationService(userId, location);
        res.json({ success: true, message: 'User location has been updated successfully.' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const resetUserPasswordController = async (req: Request, res: Response) => {
    const { phone, password, confirm, securityCode, securityAnswer } = req.body;

    if (!securityCode || !phone || !password || !confirm || !securityAnswer) {
        return res.status(400).json({ success: false, message: "Fill empty fields" });
    }

    if (password !== confirm) {
        return res.status(400).json({ success: false, message: "Passwords must match" });
    }

    try {
        const username = await UserServices.resetUserPasswordService(phone, password, securityCode, securityAnswer);
        res.json({ success: true, body: { username }, message: "Password reset successfully." });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUserController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        await UserServices.deleteUserService(userId);
        res.json({ success: true, message: 'User has been deleted successfully.' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllUsersController = async (req: Request, res: Response) => {
    try {
        const users = await UserServices.getAllUsersService();
        res.json({ success: true, users });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserByIdController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await UserServices.getUserByIdService(userId);
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: 'User not found.' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};



 



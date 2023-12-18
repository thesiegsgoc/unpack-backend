import mongoose, { Schema, Document } from "mongoose";
import argon2 from "argon2";
import { IUser, UserDocument } from "../types/user";

const UserSchema: Schema<UserDocument> = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    fullname: {
        type: String
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true,
        maxLength: 100
    },
    deliveries: {
        type: Array
    },
    status: {
        type: String,
        required: true
    },
    avatar: {
        type: Buffer
    },
    expoPushToken: {
        type: String || Number
    },
    profilePhoto: {
        type: String
    },
    rating: {
        type: Number
    },
    securityCode: {
        type: String
    },
    securityAnswer: {
        type: String
    },
    location: {
        type: Object,
        default: {}
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

/**
 * Assign the method comparePassword to the schema.
 * The method compares the provided password with
 * the hashed one stored in the database.
 * 
 * @param { String } password the password value from the user
 * @returns { Boolean} true if the password is correct, otherwise false
 */

//Pre-save hook for password hashing
UserSchema.pre<UserDocument>('save', async function (next) {
    if (this.isModified('password')) {
        try {
            const hash = await argon2.hash(this.password);
            this.password = hash;
            next();
        } catch (err: any) {
            next(err)
        }
    } else {
        next();
    }
})

/**
 * Assign the method comparePassword to the schema.
 * The method compares the provided password with
 * the hashed one stored in the database.
 * 
 * @param { String } password the password value from the user
 * @returns { Boolean} true if the password is correct, otherwise false
 */
UserSchema.methods.comparePassword = async function (password: string) {
    if (!password) {
        throw new Error('Password is missing, provide one and try again.');
    }
    try {
        const result = await argon2.verify(this.password, password);
        return result;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

const UserModel = mongoose.model<UserDocument>('User', UserSchema);
export default UserModel;

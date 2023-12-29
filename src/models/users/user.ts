import mongoose, { Schema, Document } from 'mongoose';
import argon2 from "argon2";
import { v4 as uuidv4 } from 'uuid';
export interface IUser extends Document {
    userId: string;
    name: string;
    username: string;
    fullname: string;
    phone: string;
    email?: string;
    password: string;
    deliveries: any[];
    status: string;
    avatar?: Buffer;
    expoPushToken?: any;
    profilePhoto?: string;
    canDeliver?: string;
    rating?: number;
    securityCode?: string;
    securityAnswer?: string;
    location: any;
    date: Date;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    preferredPickupLocation?: string;
    languagePreference?: string;
    dateOfBirth?: Date;
    userType: 'normal' | 'vendor' | 'zoneManager' | 'driver' | 'agent';
    emailVerified: boolean;
    paymentMethod?: any;
    isModified(path: string): boolean;
    comparePassword(password: string): Promise<boolean>;
}

export const UserSchema: Schema<IUser> = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        default: uuidv4,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: true,
        maxLength: 100
    },
    status: {
        type: String,
        required: false
    },
    avatar: {
        type: Buffer,
        required: false
    },
    location: {
        type: Schema.Types.Mixed,
        default: {}
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    userType: {
        type: String,
        enum: ['user', 'vendor','driver', 'agent', "admin"],
    },
    deliveries: [Schema.Types.Mixed],
    expoPushToken: Schema.Types.Mixed,
    profilePhoto: String,
    canDeliver: String,
    rating: Number,
    securityCode: String,
    securityAnswer: String,
    date: {
        type: Date,
        default: Date.now,
    },
    preferredPickupLocation: String,
    languagePreference: String,
    dateOfBirth: Date,
    emailVerified: Boolean,
    paymentMethod: Schema.Types.Mixed,
});

/**
 * Assign the method comparePassword to the schema.
 * The method compares the provided password with
 * the hashed one stored in the database.
 * @param { String } password the password value from the user
 * @returns { Boolean} true if the password is correct, otherwise false
 */

//Pre-save hook for password hashing
UserSchema.pre<IUser>('save', async function (next) {
    if (this.isModified('password')) {
        try {
            const hash = await argon2.hash(this.password);
            this.password = hash;
            next();
        } catch (err: any) {
            next(err);
        }
    } else {
        next();
    }
});


/**
 * Assign the method comparePassword to the schema.
 * The method compares the provided password with
 * the hashed one stored in the database.
 * 
 * @param { String } password the password value from the user
 * @returns { Boolean} true if the password is correct, otherwise false
 */

const UserModel = mongoose.model<IUser>('User', UserSchema);
export default UserModel;

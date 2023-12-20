import { Document } from 'mongoose';

interface IUser {
    userId: string;
    username: string;
    fullname?: string;
    phone: string;
    email?: string;
    password: string;
    deliveries?: Array<any>;
    status: string;
    avatar?: Buffer;
    expoPushToken?: string | number;
    profilePhoto?: string;
    rating?: number;
    securityCode?: string;
    securityAnswer?: string;
    location?: Record<string, unknown>;
    date?: Date;
    canDeliver?: string;
    comparePassword(password: string): Promise<boolean>;
}

type UserDocument = IUser & Document;

export { IUser, UserDocument };

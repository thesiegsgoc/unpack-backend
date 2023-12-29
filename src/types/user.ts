import mongoose, { Schema, Document } from 'mongoose';
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
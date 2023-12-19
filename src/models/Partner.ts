import mongoose, { Schema, Document } from 'mongoose';

interface Partner {
    userId: string;
    username: string;
    fullname?: string;
    phone: string;
    email?: string;
    password: string;
    deliveries?: any[];
    status: string;
    avatar?: Buffer;
    expoPushToken?: string | number;
    profilePhoto?: string;
    rating?: number;
    securityCode?: string;
    securityAnswer?: string;
    location?: object;
    date?: Date;
}

type PartnerDocument = Partner & Document;

const PartnerSchema: Schema<PartnerDocument> = new mongoose.Schema({
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

const PartnerModel = mongoose.model<PartnerDocument>('Partner', PartnerSchema);

export default PartnerModel;

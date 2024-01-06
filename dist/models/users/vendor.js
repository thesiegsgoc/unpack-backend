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
const mongoose_1 = __importStar(require("mongoose"));
const uuid_1 = require("uuid");
const VendorSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: true,
        default: uuid_1.v4,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        maxLength: 100,
        required: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    status: {
        type: String,
    },
    avatar: {
        type: Buffer,
    },
    location: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        coordinates: {},
    },
    userType: {
        type: String,
        enum: ['normal', 'vendor', 'zoneManager', 'driver', 'agent'],
    },
    expoPushToken: mongoose_1.Schema.Types.Mixed,
    profilePhoto: String,
    canDeliver: String,
    rating: Number,
    securityCode: String,
    securityAnswer: String,
    preferredPickupLocation: String,
    languagePreference: String,
    dateOfBirth: Date,
    emailVerified: Boolean,
    paymentMethod: mongoose_1.Schema.Types.Mixed,
    date: {
        type: Date,
        default: Date.now,
    },
    deliveries: [mongoose_1.Schema.Types.Mixed],
    // Original VendorSchema fields
    businessName: {
        type: String,
        required: true,
    },
    businessType: {
        type: String,
        enum: ['Sole Proprietorship', 'Limited Company'],
        required: true,
    },
    businessAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
    },
    contactDetails: {
        phoneNumbers: [String],
        emailAddresses: [String],
        website: String,
    },
    businessLicenses: [String],
    taxCertificates: {
        TIN: String,
    },
});
const VendorModel = mongoose_1.default.model('Vendor', VendorSchema);
exports.default = VendorModel;

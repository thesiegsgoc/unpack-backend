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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("./user"));
const mongoose_1 = __importStar(require("mongoose"));
const uuid_1 = require("uuid");
const DriverSchema = new mongoose_1.default.Schema({
    driverId: {
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
    licenseInfo: {
        number: { type: String, required: true },
        expiryDate: { type: Date, required: true },
        issuingState: { type: String, required: true },
    },
    vehicleInfo: {
        make: { type: String, required: true },
        model: { type: String, required: true },
        year: { type: Number, required: true },
        color: { type: String, required: true },
        licensePlate: { type: String, required: true },
        insurance: { type: String, required: true },
        registrationDocument: { type: String, required: true },
    },
    driverStatus: { type: String, required: true },
    currentLocation: { type: String, required: true },
    availability: { type: String, required: true },
    preferredDeliveryTypes: [{ type: String }],
    realTimeStatusUpdates: { type: String },
    earnings: {
        rates: { type: Number },
        incentives: { type: Number },
        deductions: { type: Number },
        paymentHistory: [{ type: mongoose_1.default.Schema.Types.Mixed }],
    },
    performance: {
        completionRate: { type: Number },
        onTimeDeliveryRate: { type: Number },
        customerRatings: [{ type: Number }],
        safetyAndComplianceIndicators: [{ type: String }],
    },
});
DriverSchema.index({ currentLocation: '2dsphere' });
const DriverModel = user_1.default.discriminator('Driver', DriverSchema);
exports.default = DriverModel;

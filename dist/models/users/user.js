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
exports.UserSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const argon2_1 = __importDefault(require("argon2"));
const uuid_1 = require("uuid");
exports.UserSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: true,
        default: uuid_1.v4,
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
        type: mongoose_1.Schema.Types.Mixed,
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
        enum: ['user', 'vendor', 'driver', 'agent', "admin"],
    },
    deliveries: [mongoose_1.Schema.Types.Mixed],
    expoPushToken: mongoose_1.Schema.Types.Mixed,
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
    paymentMethod: mongoose_1.Schema.Types.Mixed,
});
/**
 * Assign the method comparePassword to the schema.
 * The method compares the provided password with
 * the hashed one stored in the database.
 * @param { String } password the password value from the user
 * @returns { Boolean} true if the password is correct, otherwise false
 */
//Pre-save hook for password hashing
exports.UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        try {
            const hash = await argon2_1.default.hash(this.password);
            this.password = hash;
            next();
        }
        catch (err) {
            next(err);
        }
    }
    else {
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
exports.UserSchema.methods.comparePassword = async function (password) {
    if (!password) {
        throw new Error('Password is missing, provide one and try again.');
    }
    try {
        const result = await argon2_1.default.verify(this.password, password);
        return result;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
const UserModel = mongoose_1.default.model('User', exports.UserSchema);
exports.default = UserModel;

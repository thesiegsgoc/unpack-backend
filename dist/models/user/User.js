"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const argon2_1 = __importDefault(require("argon2"));
const UserSchema = new mongoose_1.default.Schema({
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
    canDeliver: {
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
//Pre-save hook for password hashing
UserSchema.pre('save', async function (next) {
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
UserSchema.methods.comparePassword = async function (password) {
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
const UserModel = mongoose_1.default.model('User', UserSchema);
exports.default = UserModel;

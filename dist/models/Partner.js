"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const PartnerSchema = new mongoose_1.default.Schema({
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
const PartnerModel = mongoose_1.default.model('Partner', PartnerSchema);
exports.default = PartnerModel;

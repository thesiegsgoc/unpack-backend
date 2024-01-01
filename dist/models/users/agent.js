"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AgentSchema = new mongoose_1.default.Schema({
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
const AgentModel = mongoose_1.default.model('Agent', AgentSchema);
exports.default = AgentModel;

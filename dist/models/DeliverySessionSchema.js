"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliverySession = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const DeliverySessionSchema = new mongoose_1.default.Schema({
    deliveryOrder: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'DeliveryOrder',
        required: true,
    },
    currentHandler: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Driver',
    },
    senderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    },
    currentLocation: {
        latitude: Number,
        longitude: Number,
    },
    status: {
        type: String,
        default: 'In Transit', // Example statuses: In Transit, Delivered, Cancelled
    },
    startTime: Date,
    endTime: Date,
});
exports.DeliverySession = mongoose_1.default.model('DeliverySession', DeliverySessionSchema);

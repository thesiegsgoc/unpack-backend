"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliverySchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.DeliverySchema = new mongoose_1.default.Schema({
    deliveryId: {
        type: String,
    },
    receiverId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    },
    senderId: {
        type: String,
        required: true,
    },
    driverId: {
        type: String,
    },
    packageSize: {
        type: String,
        required: true, // Assuming 'size' is required
    },
    quantity: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
    },
    dropoffLocation: {
        type: Object,
        required: true,
    },
    pickupLocation: {
        type: Array, // Consider a more specific type or a sub-schema for locations
    },
    currentHandler: {
        type: Object, // Consider a reference to a User or Driver model if applicable
    },
    pickupDate: {
        type: String,
    },
    deliveryDate: {
        type: String,
    },
    dropOffCost: {
        type: Object, // Consider a more specific schema or type if needed
    },
    pickUpCost: {
        type: Object, // Same as above
    },
    deliveryCost: {
        type: Number,
    },
    name: {
        type: String,
    },
    notes: {
        type: String,
        maxLength: 255,
    },
    status: {
        type: Object,
        default: {
            value: 'pending',
        },
    },
    startTime: Date,
    endTime: Date,
});
const DeliveryModel = mongoose_1.default.model('Delivery', exports.DeliverySchema);
exports.default = DeliveryModel;

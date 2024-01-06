"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const DeliverySchema = new mongoose_1.default.Schema({
    deliveryId: {
        type: String,
    },
    receiverId: {
        type: String,
    },
    vendorId: {
        //This is the sender ID, The person who requested the delivery
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
    parcel: {
        type: String,
        required: true, // Based on the new fields
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
            value: 'In Process',
        },
    },
});
const DeliveryModel = mongoose_1.default.model('Delivery', DeliverySchema);
exports.default = DeliveryModel;

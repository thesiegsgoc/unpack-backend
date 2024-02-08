"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const DeliverySchema = new mongoose_1.default.Schema({
    deliveryId: {
        type: String,
        required: true,
    },
    receiverId: {
        type: String,
    },
    userId: {
        type: String,
        required: true,
    },
    partnerId: {
        type: String,
    },
    receiver: {
        type: String,
    },
    delivery_quantity: {
        type: Number,
        required: true,
    },
    phoneNumber: {
        type: String,
    },
    package_size: {
        type: String,
    },
    delivery_type: {
        type: String,
    },
    dropoffLocation: {
        type: Object,
    },
    delivery_notes: {
        type: String,
    },
    pickupLocation: {
        type: Object,
    },
    current_handler: {
        type: Object,
    },
    scheduled_handler: {
        type: String || undefined,
    },
    delivery_time: {
        type: String,
    },
    delivery_date: {
        type: String,
    },
    drop_off_cost: {
        type: Object,
    },
    pick_up_cost: {
        type: Object,
    },
    delivery_cost: {
        type: Number,
        required: true,
    },
    delivery_status: {
        type: Object,
        default: {
            value: 'In Process',
        },
    },
    orderId: {
        type: String,
    },
    vendorId: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const DeliveryModel = mongoose_1.default.model('Delivery', DeliverySchema);
exports.default = DeliveryModel;

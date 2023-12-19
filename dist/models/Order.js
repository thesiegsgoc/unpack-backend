"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const OrderSchema = new mongoose_1.default.Schema({
    orderId: {
        type: String,
        required: true,
    },
    parcel: {
        type: String,
        required: true,
    },
    name: {
        type: String
    },
    quantity: {
        type: Number,
        required: true
    },
    size: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const OrderModel = mongoose_1.default.model("Order", OrderSchema);
exports.default = OrderModel;

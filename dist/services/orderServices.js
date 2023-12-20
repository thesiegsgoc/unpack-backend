"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrder = exports.createOrder = void 0;
// orderService.ts
const order_1 = __importDefault(require("../models/order"));
const db_1 = __importDefault(require("../util/db"));
const createOrder = async (orderData) => {
    const newOrder = new order_1.default(orderData);
    await newOrder.save();
    return newOrder;
};
exports.createOrder = createOrder;
const updateOrder = async (orderId, updateData) => {
    await db_1.default.orders.updateOne({ orderId }, { $set: updateData });
};
exports.updateOrder = updateOrder;

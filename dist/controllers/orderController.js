"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderInfo = exports.addOrder = void 0;
const Order_1 = __importDefault(require("../models/Order")); // Ensure this is a TypeScript compatible model
const db_1 = __importDefault(require("../util/db")); // Adjust the import if necessary
const addOrder = async (req, res) => {
    const { name, parcel, quantity, size, orderId } = req.body;
    if (!name || !parcel || !quantity || !size || !orderId) {
        return res.json({ success: false, message: 'Fill out empty fields.' });
    }
    else {
        try {
            const newOrder = new Order_1.default({
                name,
                parcel,
                quantity,
                size,
                orderId
            });
            await newOrder.save();
            return res.json({ status: 'OK', data: newOrder });
        }
        catch (error) {
            return res.json({ success: false, message: error.message });
        }
    }
};
exports.addOrder = addOrder;
const updateOrderInfo = async (req, res) => {
    const { orderId } = req.body;
    try {
        await db_1.default.orders.updateOne({ orderId }, { $set: { ...req.body } });
        return res.json({ success: true, message: 'Order info has updated successfully.' });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.updateOrderInfo = updateOrderInfo;
const orderController = { updateOrderInfo: exports.updateOrderInfo, addOrder: exports.addOrder };
exports.default = orderController;

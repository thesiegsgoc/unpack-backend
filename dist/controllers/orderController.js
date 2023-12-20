"use strict";
// orderController.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderInfo = exports.addOrder = void 0;
const OrderService = __importStar(require("../services/orderServices")); // Adjust the import path as needed
const addOrder = async (req, res) => {
    const { name, parcel, quantity, size, orderId } = req.body;
    if (!name || !parcel || !quantity || !size || !orderId) {
        return res.json({ success: false, message: 'Fill out empty fields.' });
    }
    else {
        try {
            const newOrder = await OrderService.createOrder({ name, parcel, quantity, size, orderId });
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
        await OrderService.updateOrder(orderId, req.body);
        return res.json({ success: true, message: 'Order info has updated successfully.' });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.updateOrderInfo = updateOrderInfo;
const orderController = { updateOrderInfo: exports.updateOrderInfo, addOrder: exports.addOrder };
exports.default = orderController;

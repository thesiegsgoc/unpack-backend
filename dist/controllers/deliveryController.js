"use strict";
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
exports.getHandlersLocationController = exports.pickupDeliveryController = exports.getDeliveryByIdController = exports.getDeliveryIdsController = exports.getPartnerDeliveryHistoryController = exports.getUserDeliveryHistoryController = exports.getAllDeliveriesController = exports.trackDeliveryController = exports.encryptDeliveryDetailsController = exports.updateDeliveryController = exports.createDeliveryController = exports.calculateDeliveryCostController = void 0;
const DeliveryServices = __importStar(require("../services/deliveryService"));
const deliveryCostService_1 = require("./../services/deliveryCostService");
const calculateDeliveryCostController = async (req, res) => {
    try {
        const deliveryData = req.body;
        const delivery_cost = await (0, deliveryCostService_1.calculateDeliveryCostService)(deliveryData);
        return res.json({
            success: true,
            delivery_cost,
            message: 'Delivery cost calculated successfully',
        });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.calculateDeliveryCostController = calculateDeliveryCostController;
const createDeliveryController = async (req, res) => {
    try {
        const deliveryData = req.body;
        const result = await DeliveryServices.createDeliveryService(deliveryData);
        return res.json({
            success: true,
            message: 'Delivery ordered successfully',
            trackingNumber: result.trackingNumber,
        });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.createDeliveryController = createDeliveryController;
const updateDeliveryController = async (req, res) => {
    try {
        const deliveryData = req.body;
        const result = await DeliveryServices.updateDeliveryService(deliveryData);
        return res.json({
            success: true,
            delivery: result,
            message: 'Delivery updated successfully',
        });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.updateDeliveryController = updateDeliveryController;
const encryptDeliveryDetailsController = async (req, res) => {
    try {
        const { deliveryIds } = req.body;
        const encryptedDetails = await DeliveryServices.encryptDeliveryDetailsService(deliveryIds);
        return res.json({
            success: true,
            body: encryptedDetails,
            message: 'Delivery details have been encrypted successfully.',
        });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.encryptDeliveryDetailsController = encryptDeliveryDetailsController;
const trackDeliveryController = async (req, res) => {
    try {
        const { trackingId } = req.params;
        const trackingDetails = await DeliveryServices.trackDeliveryService(trackingId);
        return res.json({
            success: true,
            body: trackingDetails,
            message: 'Tracking details retrieved successfully.',
        });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.trackDeliveryController = trackDeliveryController;
const getAllDeliveriesController = async (req, res) => {
    try {
        const allDeliveries = await DeliveryServices.getAllDeliveriesService();
        return res.json({
            success: true,
            body: allDeliveries,
            message: 'All delivery details retrieved successfully.',
        });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.getAllDeliveriesController = getAllDeliveriesController;
const getUserDeliveryHistoryController = async (req, res) => {
    try {
        const { userId } = req.body;
        const deliveryHistory = await DeliveryServices.getUserDeliveryHistoryService(userId);
        return res.json({
            success: true,
            body: deliveryHistory,
            message: "User's delivery history retrieved successfully.",
        });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.getUserDeliveryHistoryController = getUserDeliveryHistoryController;
const getPartnerDeliveryHistoryController = async (req, res) => {
    try {
        const { partnerId } = req.body;
        const deliveryHistory = await DeliveryServices.getPartnerDeliveryHistoryService(partnerId);
        return res.json({
            success: true,
            body: deliveryHistory,
            message: 'Delivery history retrieved successfully.',
        });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.getPartnerDeliveryHistoryController = getPartnerDeliveryHistoryController;
const getDeliveryIdsController = async (req, res) => {
    try {
        const { userId } = req.body;
        const encryptedDeliveryIds = await DeliveryServices.getDeliveryIdsService(userId);
        return res.json({
            success: true,
            body: encryptedDeliveryIds,
            message: 'Delivery details have been encrypted successfully.',
        });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.getDeliveryIdsController = getDeliveryIdsController;
const getDeliveryByIdController = async (req, res) => {
    try {
        console.log('Get delivery by ID');
        const { deliveryId } = req.params;
        const result = await DeliveryServices.getDeliveryByIdService(deliveryId);
        res.json(result);
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
};
exports.getDeliveryByIdController = getDeliveryByIdController;
const pickupDeliveryController = async (req, res) => {
    try {
        const { encryptedData, partnerId } = req.body;
        const result = await DeliveryServices.pickupDeliveryService(encryptedData, partnerId);
        return res.json(result);
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.pickupDeliveryController = pickupDeliveryController;
const getHandlersLocationController = async (req, res) => {
    try {
        const { scheduledHandler } = req.body;
        const handlerLocation = await DeliveryServices.getHandlersLocationService(scheduledHandler);
        return res.json({
            success: true,
            body: { handlerLocation },
            message: 'Handlers location retrieved successfully.',
        });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
exports.getHandlersLocationController = getHandlersLocationController;

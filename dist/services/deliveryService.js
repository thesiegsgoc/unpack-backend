"use strict";
// deliveryService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHandlersLocationService = exports.pickupDeliveryService = exports.getDeliveryIdsService = exports.getPartnerDeliveryHistoryService = exports.getUserDeliveryHistoryService = exports.trackDeliveryService = exports.encryptDeliveryDetailsService = exports.addDeliveryService = void 0;
const cryptr_1 = __importDefault(require("cryptr"));
const cryptr = new cryptr_1.default('myTotallySecretKey');
// Define all your interfaces here
const addDeliveryService = async (deliveryData) => {
    // Logic from addDelivery controller
    // Return appropriate values or throw errors
};
exports.addDeliveryService = addDeliveryService;
const encryptDeliveryDetailsService = async (deliveryIds) => {
    // Logic from encryptDeliveryDetails controller
};
exports.encryptDeliveryDetailsService = encryptDeliveryDetailsService;
const trackDeliveryService = async (trackingId) => {
    // Logic from trackDelivery controller
};
exports.trackDeliveryService = trackDeliveryService;
const getUserDeliveryHistoryService = async (userId) => {
    // Logic from getUserDeliveryHistory controller
};
exports.getUserDeliveryHistoryService = getUserDeliveryHistoryService;
const getPartnerDeliveryHistoryService = async (partnerId) => {
    // Logic from getPartnerDeliveryHistory controller
};
exports.getPartnerDeliveryHistoryService = getPartnerDeliveryHistoryService;
const getDeliveryIdsService = async (userID) => {
    // Logic from getDeliveryIds controller
};
exports.getDeliveryIdsService = getDeliveryIdsService;
const pickupDeliveryService = async (encryptedData, partnerId) => {
    // Logic from pickupDelivery controller
};
exports.pickupDeliveryService = pickupDeliveryService;
const getHandlersLocationService = async (scheduledHandler) => {
    // Logic from getHandlersLocation controller
};
exports.getHandlersLocationService = getHandlersLocationService;

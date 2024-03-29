"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryCostController = exports.assignHandlerController = exports.updateZoneHandlerAvailabilityController = exports.deleteZoneHandlerController = exports.addZoneHandlerController = exports.deleteZoneController = exports.updateZoneInfoController = exports.registerZoneController = exports.getClosestZoneController = exports.getAllZonesController = void 0;
const zoneService_1 = require("../services/zoneService");
const deliveryCostService_1 = require("../services/deliveryCostService");
const getAllZonesController = async (req, res) => {
    try {
        const zones = await (0, zoneService_1.getAllZonesService)();
        res.json({
            success: true,
            body: zones,
            message: 'All zones retrieved successfully.',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllZonesController = getAllZonesController;
const getClosestZoneController = async (req, res) => {
    try {
        const { location } = req.body;
        if (!location ||
            typeof location.latitude !== 'number' ||
            typeof location.longitude !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'Invalid location data. Please provide latitude and longitude.',
            });
        }
        // Convert the request's location data into the format expected by the service
        const coordinates = [
            location.latitude,
            location.longitude,
        ];
        // Determine the closest zone
        const closestZone = await (0, zoneService_1.determineClosestZoneService)(coordinates);
        // Respond with the closest zone name
        res.json({
            success: true,
            closestZone: closestZone,
            message: 'Closest zone determined successfully.',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getClosestZoneController = getClosestZoneController;
const registerZoneController = async (req, res) => {
    try {
        const { zoneName, rate, centralLocation } = req.body;
        if (!zoneName ||
            !rate ||
            !centralLocation.longitude ||
            !centralLocation.latitude) {
            return res.status(400).json({
                success: false,
                message: 'A Zone should at-least have a name, transportation rate greater than 0, and valid central location.',
            });
        }
        const zoneNameResult = await (0, zoneService_1.registerZoneService)(zoneName, rate, centralLocation);
        res.json({
            success: true,
            message: `${zoneNameResult} zone is added successfully.`,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.registerZoneController = registerZoneController;
const updateZoneInfoController = async (req, res) => {
    try {
        const { zoneName, rate } = req.body;
        if (!zoneName || zoneName === '') {
            return res.status(400).json({
                success: false,
                message: 'A Zone should at-least have a name.',
            });
        }
        if (!rate || rate <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Transportation rate should be greater than 0.',
            });
        }
        await (0, zoneService_1.updateZoneInfoService)(zoneName, rate);
        res.json({
            success: true,
            message: `Zone ${zoneName}'s info is updated successfully.`,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateZoneInfoController = updateZoneInfoController;
const deleteZoneController = async (req, res) => {
    try {
        const { zoneName } = req.body;
        if (!zoneName || zoneName === '') {
            return res.status(400).json({
                success: false,
                message: 'A Zone should at-least have a name.',
            });
        }
        await (0, zoneService_1.deleteZoneService)(zoneName);
        res.json({
            success: true,
            message: `Zone ${zoneName} is deleted successfully.`,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteZoneController = deleteZoneController;
const addZoneHandlerController = async (req, res) => {
    try {
        const { zoneName, handler } = req.body;
        if (!zoneName || zoneName === '') {
            return res.status(400).json({
                success: false,
                message: 'A Zone should at-least have a name.',
            });
        }
        if (!handler) {
            return res.status(400).json({
                success: false,
                message: 'Cannot have an empty handler',
            });
        }
        await (0, zoneService_1.addZoneHandlerService)(zoneName, handler);
        res.json({
            success: true,
            message: `${handler} is successfully added as a handler in zone ${zoneName}.`,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addZoneHandlerController = addZoneHandlerController;
const deleteZoneHandlerController = async (req, res) => {
    try {
        const { zoneName, handler } = req.body;
        if (!zoneName || zoneName === '') {
            return res.status(400).json({
                success: false,
                message: 'A Zone should at-least have a name.',
            });
        }
        if (!handler) {
            return res.status(400).json({
                success: false,
                message: 'Cannot have an empty handler',
            });
        }
        await (0, zoneService_1.deleteZoneHandlerService)(zoneName, handler);
        res.json({
            success: true,
            message: `Handler ${handler} is successfully deleted as a ${zoneName} zone handler.`,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteZoneHandlerController = deleteZoneHandlerController;
const updateZoneHandlerAvailabilityController = async (req, res) => {
    try {
        const { handler, available } = req.body;
        if (!handler) {
            return res.status(400).json({
                success: false,
                message: 'Cannot have an empty handler',
            });
        }
        await (0, zoneService_1.updateZoneHandlerAvailabilityService)(handler, available);
        res.json({
            success: true,
            message: `Handler ${handler}'s availability updated successfully.`,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateZoneHandlerAvailabilityController = updateZoneHandlerAvailabilityController;
const assignHandlerController = async (req, res) => {
    try {
        const { location } = req.body;
        const handlerId = await (0, zoneService_1.assignHandlerService)(location);
        res.json({
            success: true,
            body: { handlerId },
            message: handlerId
                ? `Handler successfully scheduled to pick up a package.`
                : `No available handler found.`,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.assignHandlerController = assignHandlerController;
const deliveryCostController = async (req, res) => {
    try {
        const deliveryRequest = req.body;
        if (!deliveryRequest) {
            return res.status(400).json({
                success: false,
                message: 'Delivery Request body must be provided',
            });
        }
        const costDetails = await (0, deliveryCostService_1.calculateDeliveryCostService)(deliveryRequest);
        res.json({
            success: true,
            body: costDetails,
            message: `Cost details calculated successfully.`,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deliveryCostController = deliveryCostController;

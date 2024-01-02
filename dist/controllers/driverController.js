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
exports.deleteDriverController = exports.updateDriverDetailsController = exports.getDriverDetailsController = exports.createDriverController = void 0;
const DriverServices = __importStar(require("../services/driverService"));
const createDriverController = async (req, res) => {
    try {
        const driver = await DriverServices.registerDriverService(req.body);
        res.status(201).json({
            success: true,
            data: driver,
            message: 'Driver registration successful',
        });
    }
    catch (err) {
        console.error('Error creating driver:', err);
        if (err instanceof Error) {
            // If it's a known error with a message, send that message in the response
            res.status(400).json({ success: false, message: err.message });
        }
        else {
            // If it's an unknown error, send a generic error message
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
};
exports.createDriverController = createDriverController;
// Get Driver Details
const getDriverDetailsController = async (req, res) => {
    try {
        const { driverId } = req.params;
        const driver = await DriverServices.getDriverService(driverId);
        res.status(200).json({ success: true, data: driver });
    }
    catch (err) {
        console.error('Error getting driver details:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.getDriverDetailsController = getDriverDetailsController;
// Update Driver Details
const updateDriverDetailsController = async (req, res) => {
    try {
        const { driverId } = req.params;
        const updatedDriver = await DriverServices.updateDriverService(driverId, req.body);
        res.status(200).json({
            success: true,
            data: updatedDriver,
            message: 'Driver details updated successfully',
        });
    }
    catch (err) {
        console.error('Error updating driver details:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.updateDriverDetailsController = updateDriverDetailsController;
const deleteDriverController = async (req, res) => {
    try {
        const { driverId } = req.params;
        await DriverServices.deleteDriverService(driverId);
        res
            .status(200)
            .json({ success: true, message: 'Driver account deleted successfully' });
    }
    catch (err) {
        console.error('Error deleting driver account:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.deleteDriverController = deleteDriverController;

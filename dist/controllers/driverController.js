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
exports.getAllAvailableDriversController = exports.isDriverAvailableController = exports.deleteDriverController = exports.updateDriverController = exports.getAllDriversController = exports.getDriverDetailsController = exports.loginDriverController = exports.createDriverController = void 0;
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
const loginDriverController = async (req, res) => {
    try {
        const { username, password } = req.body;
        const { token, driver } = await DriverServices.loginDriverService(username, password);
        res.json({
            success: true,
            userID: driver.userId,
            token,
            expoPushToken: driver.expoPushToken,
            profilePhoto: driver.profilePhoto,
            username,
            rating: driver.rating || 5.0,
            phone: driver.phone,
            email: driver.email,
            status: driver.status,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.loginDriverController = loginDriverController;
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
const getAllDriversController = async (req, res) => {
    try {
        const drivers = await DriverServices.getAllDriversService();
        res.status(200).json({ success: true, data: drivers });
    }
    catch (err) {
        console.error('Error getting all drivers:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.getAllDriversController = getAllDriversController;
// Update Driver Details
const updateDriverController = async (req, res) => {
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
exports.updateDriverController = updateDriverController;
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
const isDriverAvailableController = async (req, res) => {
    try {
        // Extracting driverId from request parameters
        const { driverId } = req.params;
        // Validate the driverId if necessary
        if (!driverId) {
            return res
                .status(400)
                .json({ success: false, message: 'Driver ID is required.' });
        }
        // Call the service to check if the driver is available
        const isAvailable = await DriverServices.isDriverAvailableService(driverId);
        // Respond back with the availability status
        res.json({
            success: true,
            isAvailable,
            message: `Driver with ID ${driverId} is ${isAvailable ? 'available' : 'unavailable'}.`,
        });
    }
    catch (error) {
        // Handling errors from the service call
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.isDriverAvailableController = isDriverAvailableController;
const getAllAvailableDriversController = async (req, res) => {
    try {
        const availableDrivers = await DriverServices.getAllAvailableDriversService();
        res.json({
            success: true,
            drivers: availableDrivers,
            message: 'Available drivers retrieved successfully.',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllAvailableDriversController = getAllAvailableDriversController;

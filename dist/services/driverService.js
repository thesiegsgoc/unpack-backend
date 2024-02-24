"use strict";
//Driver accepts job
//Driver update current locations
//Driver pick up package
//Driver drop off package
//Driver update status of availability
//Driver body
/**
 * -driver
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignDriverService = exports.getAllAvailableDriversService = exports.isDriverAvailableService = exports.deleteDriverService = exports.updateDriverService = exports.getAllDriversService = exports.getDriverService = exports.loginDriverService = exports.registerDriverService = void 0;
//CRUD Driver
const db_1 = __importDefault(require("../util/db"));
const argon2_1 = __importDefault(require("argon2"));
const driver_1 = __importDefault(require("../models/users/driver"));
const generateJwtToken_1 = require("../util/generateJwtToken");
const registerDriverService = async (driverData) => {
    const existingDriver = await db_1.default.drivers.findOne({ email: driverData.email });
    if (existingDriver) {
        throw new Error(`Driver with email ${driverData.email} is already registered. Please login.`);
    }
    if (driverData) {
        try {
            const hashedPassword = await argon2_1.default.hash(driverData.password);
            const username = driverData.fullname
                ?.replace(/\s+/g, '_')
                .toLowerCase();
            const newDriver = new driver_1.default({
                ...driverData,
                username,
                password: hashedPassword,
            });
            await newDriver.save();
            return newDriver;
        }
        catch (error) {
            throw new Error('Error creating a new driver.');
        }
    }
};
exports.registerDriverService = registerDriverService;
const loginDriverService = async (username, password) => {
    const driver = await driver_1.default.findOne({ username });
    if (!driver) {
        throw new Error('Driver not found');
    }
    const isPasswordMatch = await argon2_1.default.verify(driver.password, password);
    if (!isPasswordMatch) {
        throw new Error('Incorrect password.');
    }
    const token = await (0, generateJwtToken_1.generateJwtToken)(driver.driverId);
    return {
        token,
        driver,
    };
};
exports.loginDriverService = loginDriverService;
const getDriverService = async (driverId) => {
    const driver = await driver_1.default.findById(driverId);
    if (!driver) {
        throw new Error(`Driver with ID ${driverId} not found.`);
    }
    return driver;
};
exports.getDriverService = getDriverService;
const getAllDriversService = async () => {
    try {
        let drivers = await driver_1.default.find();
        return drivers;
    }
    catch (error) { }
};
exports.getAllDriversService = getAllDriversService;
const updateDriverService = async (driverId, updatedData) => {
    const driver = await driver_1.default.findById(driverId);
    if (!driver) {
        throw new Error(`Driver with ID ${driverId} not found.`);
    }
    Object.assign(driver, updatedData);
    await driver.save();
    return driver;
};
exports.updateDriverService = updateDriverService;
const deleteDriverService = async (driverId) => {
    const driver = await driver_1.default.findById(driverId);
    if (!driver) {
        throw new Error(`Driver with ID ${driverId} not found.`);
    }
    await driver_1.default.deleteOne({ _id: driverId });
    return { message: 'Driver deleted successfully.' };
};
exports.deleteDriverService = deleteDriverService;
/**
 * Checks if a driver is available.
 * @param driverId The ID of the driver to check.
 * @returns True if the driver is available, false otherwise.
 */
// Example usage within isDriverAvailableService
const isDriverAvailableService = async (driverId) => {
    const driver = (await driver_1.default.findById(driverId));
    if (!driver) {
        throw new Error(`Driver with ID ${driverId} not found.`);
    }
    const isAvailable = driver.availability === 'available';
    return isAvailable;
};
exports.isDriverAvailableService = isDriverAvailableService;
/**
 * Fetches all available drivers.
 * @returns A promise that resolves with an array of available drivers.
 */
const getAllAvailableDriversService = async () => {
    try {
        // Assuming 'available' is the value indicating availability in the 'availability' field
        const availableDrivers = await driver_1.default.find({
            availability: 'available',
        });
        return availableDrivers;
    }
    catch (error) {
        throw new Error(`Failed to fetch available drivers: ${error.message}`);
    }
};
exports.getAllAvailableDriversService = getAllAvailableDriversService;
/**
 * Asynchronously assigns an available driver within a specified zone.
 * @param pickupZone The zone from which a driver is to be assigned.
 * @returns A promise that resolves with the assigned driver or undefined if no available driver is found.
 */
const assignDriverService = async (pickupZone) => {
    try {
        // Find all available drivers in the specified zone
        const availableDrivers = await driver_1.default.find({
            zone: pickupZone,
            availability: 'available', // Adjust based on how availability is tracked
        });
        if (availableDrivers.length === 0) {
            // No available drivers found
            return undefined;
        }
        // For simplicity, assign the first available driver
        // In a real application, you might want to use more sophisticated logic here
        const assignedDriver = availableDrivers[0];
        // Update the assigned driver's availability or any other relevant status in the database
        // For example, marking them as not available
        await driver_1.default.updateOne({ _id: assignedDriver._id }, {
            availability: 'unavailable', // Adjust based on your model
        });
        return assignedDriver;
    }
    catch (error) {
        console.error('Failed to assign a driver:', error);
        throw error; // Or handle it according to your application's error handling policy
    }
};
exports.assignDriverService = assignDriverService;

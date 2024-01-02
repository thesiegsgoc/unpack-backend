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
exports.deleteDriverService = exports.updateDriverService = exports.getDriverService = exports.registerDriverService = void 0;
//CRUD Driver
const db_1 = __importDefault(require("../util/db"));
const argon2_1 = __importDefault(require("argon2"));
const driver_1 = __importDefault(require("../models/users/driver"));
const registerDriverService = async (userData) => {
    const existingDriver = await db_1.default.drivers.findOne({ email: userData.email });
    if (existingDriver) {
        throw new Error(`Driver with email ${userData.email} is already registered. Please login.`);
    }
    if (userData) {
        try {
            const hashedPassword = await argon2_1.default.hash(userData.password);
            const username = userData.fullname
                ?.replace(/\s+/g, '_')
                .toLowerCase();
            const newDriver = new driver_1.default({
                ...userData,
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
const getDriverService = async (driverId) => {
    const driver = await driver_1.default.findById(driverId);
    if (!driver) {
        throw new Error(`Driver with ID ${driverId} not found.`);
    }
    return driver;
};
exports.getDriverService = getDriverService;
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

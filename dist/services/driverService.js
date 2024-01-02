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
exports.deleteDriverService = exports.updateDriverService = exports.getAllDriversService = exports.getDriverService = exports.loginDriverService = exports.registerDriverService = void 0;
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
    const token = await (0, generateJwtToken_1.generateJwtToken)(driver.userId);
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

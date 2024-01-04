"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignHandlerService = exports.updateZoneHandlerAvailabilityService = exports.deleteZoneHandlerService = exports.addZoneHandlerService = exports.deleteZoneService = exports.updateZoneInfoService = exports.registerZoneService = void 0;
const Zone_1 = __importDefault(require("../models/Zone"));
const db_1 = __importDefault(require("../util/db"));
const geolocation_utils_1 = require("geolocation-utils");
//TODO: Create a costs Model/Schema and CRUD operations for it
const ZONE_TO_ZONE_COST = {
    'Temeke-Ilala': 2000,
    'Temeke-Bunju': 5000,
    'Bunju-Ilala': 8000,
    'Ilala-Temeke': 2000,
    'Bunju-Temeke': 5000,
    'Ilala-Bunju': 8000,
};
const registerZoneService = async (zoneName, rate, centralLocation) => {
    const existingZone = await db_1.default.zones.findOne({ zoneName: zoneName });
    if (existingZone) {
        throw new Error(`Zone ${zoneName} already exists.`);
    }
    const zone = new Zone_1.default({
        zoneName,
        rate,
        zoneHandlers: [],
        centralLocation,
    });
    await zone.save();
    return zoneName;
};
exports.registerZoneService = registerZoneService;
const updateZoneInfoService = async (zoneName, rate) => {
    const zone = await Zone_1.default.findOne({ zoneName });
    if (!zone) {
        throw new Error(`Invalid zone name: No zone is named ${zoneName}.`);
    }
    await db_1.default.zones.updateOne({ zoneName }, { $set: { zoneName, rate } });
};
exports.updateZoneInfoService = updateZoneInfoService;
const deleteZoneService = async (zoneName) => {
    const zone = await db_1.default.zones.findOne({ zoneName });
    if (!zone) {
        throw new Error(`Can't delete a non-existent zone: No zone is named ${zoneName}.`);
    }
    await db_1.default.zones.deleteOne({ zoneName });
};
exports.deleteZoneService = deleteZoneService;
const addZoneHandlerService = async (zoneName, handlerUsername) => {
    const zone = await db_1.default.zones.findOne({ zoneName });
    if (!zone) {
        throw new Error(`Invalid zone name: No zone is named ${zoneName}.`);
    }
    const user = await db_1.default.users.findOne({ username: handlerUsername });
    if (!user) {
        throw new Error(`${handlerUsername} is not a registered user.`);
    }
    if (user.status.toLowerCase() === 'vendor' ||
        user.status.toLowerCase() === 'consumer') {
        throw new Error(`${handlerUsername} is not registered as a driver nor CPP.`);
    }
    await db_1.default.zones.updateOne({ zoneName }, {
        $push: {
            zoneHandlers: {
                $each: [{ id: user._id, available: false }],
            },
        },
    });
};
exports.addZoneHandlerService = addZoneHandlerService;
const deleteZoneHandlerService = async (zoneName, handlerUsername) => {
    const zone = await db_1.default.zones.findOne({ zoneName });
    if (!zone) {
        throw new Error(`Invalid zone name: No zone is named ${zoneName}.`);
    }
    const user = await db_1.default.users.findOne({ username: handlerUsername });
    if (!user) {
        throw new Error(`${handlerUsername} is not a registered--can't delete an unregistered user.`);
    }
    await db_1.default.zones.updateOne({ zoneName }, { $pull: { zoneHandlers: { id: user._id } } });
};
exports.deleteZoneHandlerService = deleteZoneHandlerService;
const updateZoneHandlerAvailabilityService = async (handlerUsername, available) => {
    const user = await db_1.default.users.findOne({ username: handlerUsername });
    if (!user || !user._id) {
        throw new Error(`${handlerUsername} is not a registered--can't update availability of an unregistered user.`);
    }
    await db_1.default.zones.updateMany({ 'zoneHandlers.id': user._id }, { $set: { 'zoneHandlers.$.available': available } });
};
exports.updateZoneHandlerAvailabilityService = updateZoneHandlerAvailabilityService;
const assignHandlerService = async (location) => {
    if (!location) {
        throw new Error(`Can't pick-up nor drop a package at an unknown location.`);
    }
    const zones = await Zone_1.default.find({});
    let closestZone = null; //TODO: Fix this type
    let minimumDistance = Number.MAX_VALUE;
    zones.forEach((zone) => {
        const distance = (0, geolocation_utils_1.distanceTo)({
            lat: zone.centralLocation.latitude,
            lon: zone.centralLocation.longitude,
        }, location);
        if (distance < minimumDistance) {
            closestZone = zone;
            minimumDistance = distance;
        }
    });
    if (!closestZone || !closestZone.zoneHandlers) {
        throw new Error(`Can't deliver to your location.`);
    }
    let handlerId;
    for (let i = 0; i < closestZone.zoneHandlers.length; i++) {
        const handler = closestZone.zoneHandlers[i];
        if (handler.available) {
            handlerId = handler.id;
            closestZone.zoneHandlers.splice(i, 1);
            closestZone.zoneHandlers.push(handler);
            await db_1.default.zones.updateOne({ zoneName: closestZone.zoneName }, { $set: { zoneHandlers: closestZone.zoneHandlers } });
            break;
        }
    }
    return handlerId;
};
exports.assignHandlerService = assignHandlerService;

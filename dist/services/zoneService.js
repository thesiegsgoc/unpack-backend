"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineClosestZoneService = exports.assignHandlerService = exports.updateZoneHandlerAvailabilityService = exports.deleteZoneHandlerService = exports.addZoneHandlerService = exports.deleteZoneService = exports.updateZoneInfoService = exports.registerZoneService = exports.getAllZonesService = void 0;
const Zone_1 = __importDefault(require("../models/Zone"));
const db_1 = __importDefault(require("../util/db"));
const geolocation_utils_1 = require("geolocation-utils");
const deliveryDistanceService_1 = require("./deliveryDistanceService");
const getAllZonesService = async () => {
    try {
        const zones = await Zone_1.default.find();
        return zones;
    }
    catch (error) {
        throw new Error('Failed to retrieve zone', error.message);
    }
};
exports.getAllZonesService = getAllZonesService;
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
// Revised determineClosestZoneService function that uses calculateDistanceService
async function determineClosestZoneService(coordinates) {
    try {
        let minDistance = Infinity;
        let closestZone = '';
        // Convert coordinates to the expected LocationDetails format
        const locationDetails = {
            location: {
                latitude: coordinates[0],
                longitude: coordinates[1],
            },
        };
        // Fetch all zones to pass their centers to the service
        const zones = await (0, exports.getAllZonesService)();
        const zoneCenters = zones.reduce((acc, zone) => {
            // Check if zone.centralLocation is defined
            if (zone.centralLocation &&
                typeof zone.centralLocation.latitude === 'number' &&
                typeof zone.centralLocation.longitude === 'number') {
                acc[zone.zoneName] = [
                    zone.centralLocation.latitude,
                    zone.centralLocation.longitude,
                ];
            }
            else {
                console.warn(`Zone ${zone.zoneName} does not have a valid centralLocation.`);
            }
            return acc;
        }, {});
        // Checking all the available zones and comparing their distance to the requested distance
        for (const [zone, center] of Object.entries(zoneCenters)) {
            // Convert each zone center to the expected LocationDetails format
            const centerDetails = {
                location: {
                    latitude: center[0],
                    longitude: center[1],
                },
            };
            // Since calculateDistanceService is async, use await to get the result
            const distance = await (0, deliveryDistanceService_1.calculateDistanceService)(locationDetails, centerDetails);
            if (distance) {
                if (distance < minDistance) {
                    minDistance = distance;
                    closestZone = zone;
                }
            }
        }
        return closestZone;
    }
    catch (error) {
        console.error('Error determining closest zone:', error);
        // Depending on how you want to handle errors, you could throw the error,
        // return a default value, or handle it in another appropriate way.
        throw new Error('Failed to determine closest zone due to an error.');
    }
}
exports.determineClosestZoneService = determineClosestZoneService;

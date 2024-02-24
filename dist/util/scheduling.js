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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableDriverService = exports.getDeliveryCostDetails = exports.assignHandler = exports.getHandler = exports.getPartner = exports.getZone = void 0;
//@ts-ignore
const isGeoPointInPolygon = __importStar(require("geo-point-in-polygon"));
const geolocation_utils_1 = require("geolocation-utils");
const user_1 = __importDefault(require("../models/users/user"));
const driver_1 = __importDefault(require("../models/users/driver"));
const Delivery_1 = __importDefault(require("../models/Delivery"));
const Zone_1 = __importDefault(require("../models/Zone"));
const db_1 = __importDefault(require("./db"));
const ZONES = [];
const PARTNERS = [];
const getZone = async (location) => {
    const latitude = location.latitude || location.lat;
    const longitude = location.longitude || location.lng;
    for (const zone of ZONES) {
        if (isGeoPointInPolygon([longitude, latitude], zone.coordinates)) {
            return zone.name;
        }
    }
};
exports.getZone = getZone;
const getPartner = async (location) => {
    const latitude = location.latitude;
    const longitude = location.longitude;
    for (const partner of PARTNERS) {
        if (isGeoPointInPolygon([longitude, latitude], partner.coordinates)) {
            return partner.name;
        }
    }
};
exports.getPartner = getPartner;
const getHandler = async (location) => {
    const zones = []; // Define the type of elements in zones if known
    const zoneHandlers = {}; // Define the type for zoneHandlers if known
    const zone = (0, exports.getZone)(location);
    //@ts-ignore
    const handlers = zone ? zoneHandlers[zone] : [];
    for (const handler of handlers) {
        const userDoc = await user_1.default.findById(handler).exec();
        if (userDoc && userDoc.canDeliver) {
            return handler;
        }
    }
    return 'admin';
};
exports.getHandler = getHandler;
const assignHandler = async (location) => {
    if (!location) {
        return {
            success: false,
            message: `Can't pick-up nor drop a package at an unknown location.`,
        };
    }
    const zones = await Zone_1.default.find({});
    let distanceToLocationFromZoneCenter;
    let prevDistance;
    let zoneHandlers;
    let zoneName;
    let handlerId;
    for (const zone of zones) {
        try {
            distanceToLocationFromZoneCenter = (0, geolocation_utils_1.distanceTo)({
                lat: zone.centralLocation.latitude,
                lon: zone.centralLocation.longitude,
            }, {
                lat: location.geometry.location.lat,
                lon: location.geometry.location.lng,
            });
            if (prevDistance === undefined ||
                distanceToLocationFromZoneCenter <= prevDistance) {
                prevDistance = distanceToLocationFromZoneCenter;
                zoneName = zone.zoneName;
                zoneHandlers = zone.zoneHandlers;
            }
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
    if (!zoneHandlers) {
        return {
            success: false,
            message: `Can't deliver to your location.`,
        };
    }
    try {
        for (const [index, zoneHandler] of zoneHandlers.entries()) {
            if (zoneHandler.available) {
                handlerId = zoneHandler.id;
                zoneHandlers.splice(index, 1);
                zoneHandlers.push(zoneHandler);
                // Update the database for each zone handler
                await db_1.default.zones.updateOne({ zoneName }, { $set: { zoneHandlers: zoneHandlers } });
                break; // Exit loop once a handler is found and scheduled
            }
        }
    }
    catch (error) {
        return { success: false, message: error.message };
    }
    return {
        success: true,
        body: {
            handlerId: handlerId ? handlerId : undefined,
        },
        message: `Handler successfully scheduled to pick up a package.`,
    };
};
exports.assignHandler = assignHandler;
const getDeliveryCostDetails = async (zones, location) => {
    let distanceToLocationFromZoneCenter;
    let prevDistance;
    let zoneName;
    let cost;
    for (const zone of zones) {
        distanceToLocationFromZoneCenter = (0, geolocation_utils_1.distanceTo)({
            lat: zone.centralLocation.latitude,
            lon: zone.centralLocation.longitude,
        }, {
            lat: location.latitude,
            lon: location.longitude,
        });
        if (prevDistance === undefined ||
            distanceToLocationFromZoneCenter <= prevDistance) {
            prevDistance = distanceToLocationFromZoneCenter;
            zoneName = zone.zoneName;
            cost =
                Math.round((zone.rate * distanceToLocationFromZoneCenter) / 1000000) *
                    1000;
        }
    }
    return {
        zoneName,
        cost,
    };
};
exports.getDeliveryCostDetails = getDeliveryCostDetails;
//DRIVER
const getAvailableDriverService = async (locationObj) => {
    try {
        const coordinates = [
            locationObj.location.longitude,
            locationObj.location.latitude,
        ];
        const availableDriver = await driver_1.default.findOne({
            driverStatus: 'active',
        }).exec();
        console.log('AVAILABLE DRIVER', availableDriver);
        return availableDriver ? availableDriver.driverId : undefined;
    }
    catch (error) {
        console.error('Error in getAvailableDriverService:', error);
        return undefined;
    }
};
exports.getAvailableDriverService = getAvailableDriverService;
async function assignDriverToDeliveryService(deliveryId, location) {
    try {
        const driverId = await (0, exports.getAvailableDriverService)(location);
        if (!driverId) {
            console.error('No available drivers found');
            return null;
        }
        console.log('DELIVERY ID', deliveryId);
        console.log('DRIVER ID', driverId);
        const delivery = await Delivery_1.default.findOne({ deliveryId: deliveryId }).exec();
        if (delivery) {
            delivery.driverId = driverId;
            delivery.delivery_status = 'Driver Assigned';
            const updatedDelivery = await delivery.save();
            console.log('UPDATED DELIVERY', updatedDelivery);
            return updatedDelivery;
        }
        else {
            // Handle case where delivery is not found
            console.log(`Delivery with ID ${deliveryId} not found.`);
            return null;
        }
    }
    catch (error) {
        console.error('Error assigning driver to delivery:', error);
        return null;
    }
}
const scheduling = {
    getZone: exports.getZone,
    getPartner: exports.getPartner,
    getHandler: exports.getHandler,
    assignHandler: exports.assignHandler,
    getDeliveryCostDetails: exports.getDeliveryCostDetails,
    assignDriverToDeliveryService,
};
exports.default = scheduling;

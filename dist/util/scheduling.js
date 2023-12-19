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
exports.getDeliveryCostDetails = exports.assignHandler = exports.getHandler = exports.getPartner = exports.getZone = void 0;
const isGeoPointInPolygon = __importStar(require("geo-point-in-polygon"));
const geolocation_utils_1 = require("geolocation-utils");
const User_1 = __importDefault(require("../models/User"));
const Zone_1 = __importDefault(require("../models/Zone"));
const db_1 = __importDefault(require("./db"));
const ZONES = [];
const PARTNERS = [];
/*
    For this issue--scheduling of handlers--the order of operation should be:
    1. Determine where the pick up and drop-off zones are.
    2. Check if the handlers in those zones are available.
    3. If they are not, then check the drivers in the next zone. For the case
       when there is no handler, set it to the admin. S/he should look for one
       and assign it to the delivery.
    4. Determine the people in the list and move them in order.
       
*/
const getZone = (location) => {
    const latitude = location.latitude || location.lat;
    const longitude = location.longitude || location.lng;
    for (const zone of ZONES) {
        if (isGeoPointInPolygon([longitude, latitude], zone.coordinates)) {
            return zone.name;
        }
    }
};
exports.getZone = getZone;
const getPartner = (location) => {
    const latitude = location.latitude;
    const longitude = location.longitude;
    for (const partner of PARTNERS) {
        if (isGeoPointInPolygon([longitude, latitude], partner.coordinates)) {
            return partner.name;
        }
    }
};
exports.getPartner = getPartner;
const getHandler = (location) => {
    const zones = []; // Define the type of elements in zones if known
    const zoneHandlers = {}; // Define the type for zoneHandlers if known
    const zone = (0, exports.getZone)(location);
    const handlers = zone ? zoneHandlers[zone] : [];
    for (const handler of handlers) {
        const { canDeliver } = User_1.default.findById({ _id: handler });
        if (canDeliver) {
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
            message: `Can't pick-up nor drop a package at an unkonwon location.`
        };
    }
    const zones = await Zone_1.default.find({});
    let distanceToLocationFromZoneCenter;
    let prevDistance;
    let zoneHandlers;
    let zoneName;
    let handlerId;
    zones.forEach((zone) => {
        try {
            distanceToLocationFromZoneCenter = (0, geolocation_utils_1.distanceTo)({
                lat: zone.centralLocation.latitude,
                lon: zone.centralLocation.longitude
            }, {
                lat: location.latitude,
                lon: location.longitude
            });
            if (prevDistance === undefined) {
                prevDistance = distanceToLocationFromZoneCenter;
            }
            if (distanceToLocationFromZoneCenter <= prevDistance) {
                prevDistance = distanceToLocationFromZoneCenter;
                zoneName = zone.zoneName;
                zoneHandlers = zone.zoneHandlers;
            }
        }
        catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    });
    if (!zoneHandlers) {
        return {
            success: false,
            message: `Can't deliver to your location.`
        };
    }
    try {
        zoneHandlers.forEach(async (zoneHandler, index) => {
            if (zoneHandler.available) {
                handlerId = zoneHandler.id;
                // Remove the handler from the current position in the queue:
                zoneHandlers.splice(index, 1);
                // Since the handler is scheduled to take the task, put him/her
                // back into the end of the array to ensure that handlers get
                // other handlers get the chance to deliver packages if available
                // to work:
                zoneHandlers.push(zoneHandler);
                await db_1.default.zones.updateOne({ zoneName }, {
                    $set: {
                        zoneHandlers: zoneHandlers
                    }
                });
            }
        });
    }
    catch (error) {
        return { success: false, message: error.message };
    }
    return {
        success: true,
        body: {
            handlerId: handlerId ? handlerId : undefined
        },
        message: `Handler successfully scheduled to pick up a package.`
    };
};
exports.assignHandler = assignHandler;
const getDeliveryCostDetails = (zones, location) => {
    let distanceToLocationFromZoneCenter;
    let prevDistance;
    let zoneHandlers;
    let zoneName;
    let cost;
    zones.forEach((zone) => {
        distanceToLocationFromZoneCenter = (0, geolocation_utils_1.distanceTo)({
            lat: zone.centralLocation.latitude,
            lon: zone.centralLocation.longitude
        }, {
            lat: location.latitude,
            lon: location.longitude
        });
        if (prevDistance === undefined) {
            prevDistance = distanceToLocationFromZoneCenter;
        }
        if (distanceToLocationFromZoneCenter <= prevDistance) {
            prevDistance = distanceToLocationFromZoneCenter;
            zoneName = zone.zoneName;
            zoneHandlers = zone.zoneHandlers;
            //Round to the nearest thousandths:
            cost = Math.round((zone.rate * distanceToLocationFromZoneCenter) / 1000000) * 1000;
        }
    });
    return {
        zoneName,
        cost
    };
};
exports.getDeliveryCostDetails = getDeliveryCostDetails;
const scheduling = { getZone: exports.getZone, getPartner: exports.getPartner, getHandler: exports.getHandler, assignHandler: exports.assignHandler, getDeliveryCostDetails: exports.getDeliveryCostDetails };
exports.default = scheduling;
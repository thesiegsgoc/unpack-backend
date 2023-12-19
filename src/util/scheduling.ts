import * as isGeoPointInPolygon from 'geo-point-in-polygon';
import { distanceTo } from 'geolocation-utils';
import User from "../models/User";
import Delivery from "../models/Delivery";
import Zone from '../models/Zone';
import db from './db';

const ZONES: any[] = [];
const PARTNERS: any[] = []; 


/* 
    For this issue--scheduling of handlers--the order of operation should be:
    1. Determine where the pick up and drop-off zones are.
    2. Check if the handlers in those zones are available.
    3. If they are not, then check the drivers in the next zone. For the case
       when there is no handler, set it to the admin. S/he should look for one
       and assign it to the delivery.
    4. Determine the people in the list and move them in order.
       
*/


export const getZone = (location: { latitude?: number, longitude?: number, lat?: number, lng?: number }): string | undefined => {
    const latitude = location.latitude || location.lat;
    const longitude = location.longitude || location.lng;

    for (const zone of ZONES) {
        if (isGeoPointInPolygon([longitude, latitude], zone.coordinates)) {
            return zone.name;
        }
    }
};

export const getPartner = (location: { latitude: number, longitude: number }): string | undefined => {
    const latitude = location.latitude;
    const longitude = location.longitude;

    for (const partner of PARTNERS) {
        if (isGeoPointInPolygon([longitude, latitude], partner.coordinates)) {
            return partner.name;
        }
    }
};

export const getHandler = (location: { latitude: number, longitude: number }): string => {
        const zones: any[] = []; // Define the type of elements in zones if known
        const zoneHandlers: { [key: string]: any[] } = {}; // Define the type for zoneHandlers if known
    
        const zone = getZone(location);
        const handlers = zone ? zoneHandlers[zone] : [];
    
        for (const handler of handlers) {
            const { canDeliver } = User.findById({ _id: handler });
            if (canDeliver) {
                return handler;
            }
        }
    
        return 'admin';
    };


export const assignHandler = async (location: { latitude: number, longitude: number }): Promise<any> => {

            if (!location) {
                return {
                    success: false,
                    message: `Can't pick-up nor drop a package at an unkonwon location.`
                };
            }
    
            const zones = await Zone.find({});
    
            let distanceToLocationFromZoneCenter;
            let prevDistance;
            let zoneHandlers;
            let zoneName;
            let handlerId;
            zones.forEach((zone) => {
                try {
                    distanceToLocationFromZoneCenter = distanceTo(
                        {
                            lat: zone.centralLocation.latitude,
                            lon: zone.centralLocation.longitude
                        },
                        {
                            lat: location.latitude,
                            lon: location.longitude
                        }
                    );
    
                    if (prevDistance === undefined) {
                        prevDistance = distanceToLocationFromZoneCenter;
                    }
    
                    if (distanceToLocationFromZoneCenter <= prevDistance) {
                        prevDistance = distanceToLocationFromZoneCenter;
                        zoneName = zone.zoneName;
                        zoneHandlers = zone.zoneHandlers;
                    }
                } catch (error) {
                    return {
                        success: false,
                        message: error.message
                    }
                }
            });
    
            if (!zoneHandlers) {
                return {
                    success: false,
                    message: `Can't deliver to your location.`
                }
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
                        await db.zones.updateOne(
                            { zoneName },
                            {
                                $set: {
                                    zoneHandlers: zoneHandlers
                                }
                            }
                        );
    
                    }
                });
            } catch (error) {
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

export const getDeliveryCostDetails = (zones: any[], location: { latitude: number, longitude: number }): any => {
      
            let distanceToLocationFromZoneCenter;
            let prevDistance;
            let zoneHandlers;
            let zoneName;
            let cost;
            zones.forEach((zone) => {
                distanceToLocationFromZoneCenter = distanceTo(
                    {
                        lat: zone.centralLocation.latitude,
                        lon: zone.centralLocation.longitude
                    },
                    {
                        lat: location.latitude,
                        lon: location.longitude
                    }
                );
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
            }
        
    };

const scheduling = {getZone, getPartner, getHandler, assignHandler, getDeliveryCostDetails};

export default scheduling;
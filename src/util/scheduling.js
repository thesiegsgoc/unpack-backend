const isGeoPointInPolygon = require('geo-point-in-polygon');
const ZONES = [];
const PARTNERS = [];
const User = require("../models/User");
const Delivery = require("../models/Delivery");
const Zone = require('../models/Zone');
const db = require('./db');
const { distanceTo } = require('geolocation-utils');

/* 
    For this issue--scheduling of handlers--the order of operation should be:
    1. Determine where the pick up and drop-off zones are.
    2. Check if the handlers in those zones are available.
    3. If they are not, then check the drivers in the next zone. For the case
       when there is no handler, set it to the admin. S/he should look for one
       and assign it to the delivery.
    4. Determine the people in the list and move them in order.
       

*/
module.exports = {
    getZone: (location) => {
        const latitude = location.latitude || location.lat;
        const longitude = location.longitude || location.lng;
        zones.forEach(zone => {
            if (isGeoPointInPolygon([longitude, latitude], zone.coordinates)) {
                return zone.name;
            }
        });
    },

    // getHandler: (handlers) => {
    //     handlers.forEach((handler) => {
    //         const { canDeliver } = User.findById({ _id: handler });
    //         if (canDeliver) {
    //             return handler;
    //         }
    //     })
    // },

    getHandler: (location) => {
        const zones = [];
        const zoneHandlers = {};
        // Call the API to get the zones that have the user ids
        // for all the drivers: const zones
        const zone = this.getZone(location, zones);
        const handlers = zoneHandlers[zone];
        handlers.forEach((handler) => {
            const { canDeliver } = User.findById({ _id: handler });
            if (canDeliver) {
                return handler;
            }
        })

        return 'admin';
    },

    assignHandler: async (location) => {

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
    },

    getDeliveryCostDetails: (zones, location) => {
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
                cost = zone.rate * distanceToLocationFromZoneCenter * .001;
            }
        });
        return {
            zoneName,
            cost
        }
    }

}
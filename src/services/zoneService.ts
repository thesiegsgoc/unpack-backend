import Zone from "../models/Zone"
import db from '../util/db'
import { distanceTo } from 'geolocation-utils'
import { getDeliveryCostDetails } from '../util/scheduling';

//TODO: Create a costs Model/Schema and CRUD operations for it
const ZONE_TO_ZONE_COST: Record<string, number> = {
    'Temeke-Ilala': 2000,
    'Temeke-Bunju': 5000,
    'Bunju-Ilala': 8000,
    'Ilala-Temeke': 2000,
    'Bunju-Temeke': 5000,
    'Ilala-Bunju': 8000
};

export const registerZoneService = async (zoneName: string, rate: number, centralLocation: { longitude: number; latitude: number }) => {
    const existingZone = await db.zones.findOne({ zoneName: zoneName });
    if (existingZone) {
        throw new Error(`Zone ${zoneName} already exists.`);
    }

    const zone = new Zone({
        zoneName,
        rate,
        zoneHandlers: [],
        centralLocation
    });

    await zone.save();

    return zoneName;
};

export const updateZoneInfoService = async (zoneName: string, rate: number) => {
    const zone = await Zone.findOne({ zoneName });

    if (!zone) {
        throw new Error(`Invalid zone name: No zone is named ${zoneName}.`);
    }

    await db.zones.updateOne(
        { zoneName },
        { $set: { zoneName, rate } }
    );
};


export const deleteZoneService = async (zoneName: string) => {
    const zone = await db.zones.findOne({ zoneName });

    if (!zone) {
        throw new Error(`Can't delete a non-existent zone: No zone is named ${zoneName}.`);
    }

    await db.zones.deleteOne({ zoneName });
};


export const addZoneHandlerService = async (zoneName: string, handlerUsername: string) => {
    const zone = await db.zones.findOne({ zoneName });

    if (!zone) {
        throw new Error(`Invalid zone name: No zone is named ${zoneName}.`);
    }

    const user = await db.users.findOne({ username: handlerUsername });

    if (!user) {
        throw new Error(`${handlerUsername} is not a registered user.`);
    }

    if (user.status.toLowerCase() === 'vendor' || user.status.toLowerCase() === 'consumer') {
        throw new Error(`${handlerUsername} is not registered as a driver nor CPP.`);
    }

    await db.zones.updateOne(
        { zoneName },
        {
            $push: {
                zoneHandlers: {
                    $each: [{ id: user._id, available: false }]
                }
            }
        }
    );
};


export const deleteZoneHandlerService = async (zoneName: string, handlerUsername: string) => {
    const zone = await db.zones.findOne({ zoneName });

    if (!zone) {
        throw new Error(`Invalid zone name: No zone is named ${zoneName}.`);
    }

    const user = await db.users.findOne({ username: handlerUsername });

    if (!user) {
        throw new Error(`${handlerUsername} is not a registered--can't delete an unregistered user.`);
    }

    await db.zones.updateOne(
        { zoneName },
        { $pull: { zoneHandlers: { id: user._id } } }
    );
};



export const updateZoneHandlerAvailabilityService = async (handlerUsername: string, available: boolean) => {
    const user = await db.users.findOne({ username: handlerUsername });

    if (!user || !user._id) {
        throw new Error(`${handlerUsername} is not a registered--can't update availability of an unregistered user.`);
    }

    await db.zones.updateMany(
        { "zoneHandlers.id": user._id },
        { $set: { "zoneHandlers.$.available": available } }
    );
};


export const assignHandlerService = async (location: { latitude: number, longitude: number }) => {
    if (!location) {
        throw new Error(`Can't pick-up nor drop a package at an unknown location.`);
    }

    const zones = await Zone.find({});
    let closestZone: any = null; //TODO: Fix this type
    let minimumDistance = Number.MAX_VALUE;

    zones.forEach((zone) => {
        const distance = distanceTo(
            { lat: zone.centralLocation.latitude, lon: zone.centralLocation.longitude },
            location
        );

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
            await db.zones.updateOne(
                { zoneName: closestZone.zoneName },
                { $set: { zoneHandlers: closestZone.zoneHandlers } }
            );
            break;
        }
    }

    return handlerId;
};


export const deliveryCostService = async (pickUpLocation: any, dropOffLocation: any, deliveryType: string) => {
    const zones = await Zone.find({});

    const pickUpCostDetails = getDeliveryCostDetails(zones, pickUpLocation);
    const dropOffCostDetails = getDeliveryCostDetails(zones, dropOffLocation);
    //@ts-ignore
    const zoneToZoneKey = `${pickUpCostDetails.zoneName}-${dropOffCostDetails.zoneName}`;
    const interZoneCost = ZONE_TO_ZONE_COST[zoneToZoneKey] || 0;
    //@ts-ignore
    const totalCost = pickUpCostDetails.cost + dropOffCostDetails.cost + interZoneCost;

    return {
        //@ts-ignore
        pickUpCost: pickUpCostDetails.cost,
        //@ts-ignore
        dropOffCost: dropOffCostDetails.cost,
        totalCost
    };
};

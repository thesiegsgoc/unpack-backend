"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDeliveryCostService = exports.zoneToZoneCostService = exports.locationToZoneCostService = void 0;
const deliveryDistanceService_1 = require("./deliveryDistanceService");
const ZONE_TO_ZONE_COST = {
    'Temeke-Ilala': 2000,
    'Temeke-Bunju': 5000,
    'Bunju-Ilala': 8000,
    'Ilala-Temeke': 2000,
    'Bunju-Temeke': 5000,
    'Ilala-Bunju': 8000,
};
const locationToZoneCostService = async (deliveryRequest) => {
    const { pickupLocation, dropoffLocation, package_size, delivery_type } = deliveryRequest;
    console.log('Calculating distance');
    const distance = await (0, deliveryDistanceService_1.calculateDistanceService)(pickupLocation, dropoffLocation);
    console.log('DISTANCE', distance);
    if (distance) {
        let cost = 1000; // Base cost
        cost += distance * 0.5; // Add cost based on distance
        switch (package_size) {
            case 'medium':
                cost += 5;
                break;
            case 'large':
                cost += 10;
                break;
            // No additional cost for 'small'
        }
        if (delivery_type === 'express') {
            cost *= 1.5; // Express delivery costs 50% more
        }
        return cost;
    }
    else {
        return null;
    }
};
exports.locationToZoneCostService = locationToZoneCostService;
const zoneToZoneCostService = async (pickupZone, dropoffZone) => {
    const zoneToZoneKey = `${pickupZone}-${dropoffZone}`;
    const interZoneCost = ZONE_TO_ZONE_COST[zoneToZoneKey] || 0;
    console.log('Inter zone cost', interZoneCost);
    return interZoneCost;
};
exports.zoneToZoneCostService = zoneToZoneCostService;
const calculateDeliveryCostService = async (deliveryRequest) => {
    /**
       THINGS TO BE CONSIDERED
       1. pickUpLocation,
       2. dropOffLocation,
       3. deliveryType
     */
    const { pickupZone, dropoffZone } = deliveryRequest;
    console.log('Pickup Zone', pickupZone);
    // Calculate Costs
    const pickupToDropoffCost = await (0, exports.locationToZoneCostService)(deliveryRequest);
    console.log('Pickup to dropoff cost', pickupToDropoffCost);
    const zonesCost = await (0, exports.zoneToZoneCostService)(pickupZone, dropoffZone);
    // Assuming function to calculate cost from dropoff zone back to pickup location, if needed
    // const dropoffToPickupCost = await locationToZoneCostService({ ...deliveryRequest, pickupLocation: dropoffLocation, dropoffLocation: pickupLocation });
    // Total Cost Calculation
    const totalCost = (pickupToDropoffCost || 0) + zonesCost; // + dropoffToPickupCost if applicable
    return totalCost;
};
exports.calculateDeliveryCostService = calculateDeliveryCostService;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDeliveryCostService = exports.calculateDistanceService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const googleMapsApiKey = config_1.default.GOOGLE_MAPS_API_KEY;
const calculateDistanceService = async (pickupLocation, dropoffLocation) => {
    // Extract latitude and longitude from the location details
    const pickupLat = pickupLocation.geometry.location.lat;
    const pickupLng = pickupLocation.geometry.location.lng;
    const deliveryLat = dropoffLocation.geometry.location.lat;
    const deliveryLng = dropoffLocation.geometry.location.lng;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLng}&destinations=${deliveryLat},${deliveryLng}&key=${googleMapsApiKey}`;
    try {
        const response = await axios_1.default.get(url);
        const data = response.data;
        if (data.rows[0].elements[0].status === 'OK') {
            const distance = data.rows[0].elements[0].distance.value; // Distance in meters
            return distance / 1000; // Convert to kilometers
        }
        else {
            throw new Error('Distance calculation failed: ' + data.rows[0].elements[0].status);
        }
    }
    catch (error) {
        console.error('Error calculating distance:', error);
        throw error;
    }
};
exports.calculateDistanceService = calculateDistanceService;
const calculateDeliveryCostService = async (deliveryRequest) => {
    const { pickupLocation, dropoffLocation, package_size, delivery_type } = deliveryRequest;
    const distance = await (0, exports.calculateDistanceService)(pickupLocation, dropoffLocation);
    let cost = 10; // Base cost
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
};
exports.calculateDeliveryCostService = calculateDeliveryCostService;

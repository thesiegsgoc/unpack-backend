"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDeliveryCostService = exports.calculateDistanceService = void 0;
// Import axios for HTTP requests and your configuration for API keys
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
// Ensure your Google Maps API key is correctly set in your config
const googleMapsApiKey = config_1.default.GOOGLE_MAPS_API_KEY;
// interface LocationData {
//   location: Location
// }
// interface DeliveryRequestBody {
//   pickupLocation: LocationData
//   deliveryLocation: LocationData
//   package_size: 'small' | 'medium' | 'large'
//   delivery_type: 'standard' | 'express'
// }
// Calculates distance between two locations using the Google Maps Distance Matrix API
const calculateDistanceService = async (pickupLocation, dropoffLocation) => {
    const { location: pickup_location } = pickupLocation;
    const { location: delivery_location } = dropoffLocation;
    const { latitude: pickupLat, longitude: pickupLng } = pickup_location;
    const { latitude: deliveryLat, longitude: deliveryLng } = delivery_location;
    console.log(pickupLat, pickupLng, deliveryLat, deliveryLng);
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLng}&destinations=${deliveryLat},${deliveryLng}&key=${googleMapsApiKey}`;
    try {
        const response = await axios_1.default.get(url);
        const data = response.data;
        if (data.rows[0].elements[0].status === 'OK') {
            const distance = data.rows[0].elements[0].distance.value; // Distance in meters
            console.log(`Distance: ${distance / 1000} km`); // Logging the distance for debugging
            return distance / 1000; // Convert to kilometers
        }
        else {
            throw new Error('Distance calculation failed: ' + data.rows[0].elements[0].status);
        }
    }
    catch (error) {
        console.error('Error calculating distance:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
};
exports.calculateDistanceService = calculateDistanceService;
// Calculates delivery cost based on distance, package size, and delivery type
const calculateDeliveryCostService = async (deliveryRequest) => {
    const { pickupLocation, dropoffLocation, package_size, delivery_type } = deliveryRequest;
    try {
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
        console.log(`Total Delivery Cost: $${cost}`); // Logging the total cost for debugging
        return cost;
    }
    catch (error) {
        console.error('Error calculating delivery cost:', error);
        throw error; // Ensure errors are propagated up for proper handling
    }
};
exports.calculateDeliveryCostService = calculateDeliveryCostService;

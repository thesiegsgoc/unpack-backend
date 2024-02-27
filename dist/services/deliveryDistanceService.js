"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistanceService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const googleMapsApiKey = config_1.default.GOOGLE_MAPS_API_KEY;
const calculateDistanceService = async (pickupLocation, dropoffLocation) => {
    console.log('Pickup location', JSON.stringify(pickupLocation, null, 2));
    const pickupLat = pickupLocation.geometry.location.latitude;
    const pickupLng = pickupLocation.geometry.location.longitude;
    const deliveryLat = dropoffLocation.geometry.location.latitude;
    const deliveryLng = dropoffLocation.geometry.location.longitude;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLng}&destinations=${deliveryLat},${deliveryLng}&key=${googleMapsApiKey}`;
    try {
        const response = await axios_1.default.get(url);
        const data = response.data;
        console.log('DATA ', data);
        // Checking if the API returned an error
        if (data.status !== 'OK') {
            throw new Error(`API Error: ${data.status} - ${data.error_message || 'No error message provided by API.'}`);
        }
        if (data.rows[0].elements[0].status === 'OK') {
            const distance = data.rows[0].elements[0].distance.value; // Distance in meters
            console.log('Distance', distance);
            return distance / 1000; // Convert to kilometers
        }
        else {
            console.log(`Distance calculation failed: ${data.rows[0].elements[0].status}`);
            return null;
        }
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            // This means the error is specific to axios (e.g., network error, bad response)
            console.error(`Axios-specific error calculating distance: ${error.message}`, error.response?.data);
            throw new Error(`Axios-specific error: ${error.message}`);
        }
        else if (error instanceof Error) {
            // Generic error (e.g., thrown manually above)
            console.error(`Error calculating distance: ${error.message}`);
            throw error;
        }
        else {
            // Unknown error type
            console.error('Unknown error calculating distance:', error);
            throw new Error('Unknown error occurred while calculating distance');
        }
    }
};
exports.calculateDistanceService = calculateDistanceService;

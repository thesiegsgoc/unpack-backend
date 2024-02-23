import axios from 'axios'
import config from '../config'
const googleMapsApiKey = config.GOOGLE_MAPS_API_KEY

export interface LocationDetails {
  geometry: Geometry
}
export const calculateDistanceService = async (
  pickupLocation: any,
  dropoffLocation: any
): Promise<number | null> => {
  const pickupLat = pickupLocation.location.latitude
  const pickupLng = pickupLocation.location.longitude
  const deliveryLat = dropoffLocation.location.latitude
  const deliveryLng = dropoffLocation.location.longitude

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLng}&destinations=${deliveryLat},${deliveryLng}&key=${googleMapsApiKey}`

  try {
    const response = await axios.get(url)
    const data = response.data

    console.log('DATA ', data)
    // Checking if the API returned an error
    if (data.status !== 'OK') {
      throw new Error(
        `API Error: ${data.status} - ${
          data.error_message || 'No error message provided by API.'
        }`
      )
    }

    if (data.rows[0].elements[0].status === 'OK') {
      const distance = data.rows[0].elements[0].distance.value // Distance in meters
      console.log('Distance', distance)
      return distance / 1000 // Convert to kilometers
    } else {
      console.log(
        `Distance calculation failed: ${data.rows[0].elements[0].status}`
      )
      return null
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // This means the error is specific to axios (e.g., network error, bad response)
      console.error(
        `Axios-specific error calculating distance: ${error.message}`,
        error.response?.data
      )
      throw new Error(`Axios-specific error: ${error.message}`)
    } else if (error instanceof Error) {
      // Generic error (e.g., thrown manually above)
      console.error(`Error calculating distance: ${error.message}`)
      throw error
    } else {
      // Unknown error type
      console.error('Unknown error calculating distance:', error)
      throw new Error('Unknown error occurred while calculating distance')
    }
  }
}

import axios from 'axios'
import config from '../config'

const googleMapsApiKey = config.GOOGLE_MAPS_API_KEY

export interface Geometry {
  location: {
    lat: number
    lng: number
  }
}

export interface LocationDetails {
  geometry: Geometry
  // Include other properties as needed
}

export const calculateDistanceService = async (
  pickupLocation: LocationDetails,
  dropoffLocation: LocationDetails
): Promise<number> => {
  // Extract latitude and longitude from the location details
  const pickupLat = pickupLocation.geometry.location.lat
  const pickupLng = pickupLocation.geometry.location.lng
  const deliveryLat = dropoffLocation.geometry.location.lat
  const deliveryLng = dropoffLocation.geometry.location.lng

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLng}&destinations=${deliveryLat},${deliveryLng}&key=${googleMapsApiKey}`

  try {
    const response = await axios.get(url)
    const data = response.data
    if (data.rows[0].elements[0].status === 'OK') {
      const distance = data.rows[0].elements[0].distance.value // Distance in meters
      return distance / 1000 // Convert to kilometers
    } else {
      throw new Error(
        'Distance calculation failed: ' + data.rows[0].elements[0].status
      )
    }
  } catch (error) {
    console.error('Error calculating distance:', error)
    throw error
  }
}

interface DeliveryRequestBody {
  pickupLocation: LocationDetails
  dropoffLocation: LocationDetails
  package_size: 'small' | 'medium' | 'large'
  delivery_type: 'standard' | 'express'
}

export const calculateDeliveryCostService = async (
  deliveryRequest: DeliveryRequestBody
): Promise<number> => {
  const { pickupLocation, dropoffLocation, package_size, delivery_type } =
    deliveryRequest

  const distance = await calculateDistanceService(
    pickupLocation,
    dropoffLocation
  )

  let cost = 10 // Base cost
  cost += distance * 0.5 // Add cost based on distance

  switch (package_size) {
    case 'medium':
      cost += 5
      break
    case 'large':
      cost += 10
      break
    // No additional cost for 'small'
  }

  if (delivery_type === 'express') {
    cost *= 1.5 // Express delivery costs 50% more
  }

  return cost
}

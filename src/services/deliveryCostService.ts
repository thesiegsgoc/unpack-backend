import axios from 'axios'
import config from '../config'
import { calculateDistanceService } from './deliveryDistanceService'
import Zones from '../models/Zone'

const ZONE_TO_ZONE_COST: Record<string, number> = {
  'Temeke-Ilala': 2000,
  'Temeke-Bunju': 5000,
  'Bunju-Ilala': 8000,
  'Ilala-Temeke': 2000,
  'Bunju-Temeke': 5000,
  'Ilala-Bunju': 8000,
}

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

interface DeliveryRequestBody {
  pickupLocation: LocationDetails
  dropoffLocation: LocationDetails
  dropoffZone: string
  pickupZone: string
  package_size: 'small' | 'medium' | 'large'
  delivery_type: 'standard' | 'express'
}

export const locationToZoneCostService = async (
  deliveryRequest: DeliveryRequestBody
): Promise<number | null> => {
  const { pickupLocation, dropoffLocation, package_size, delivery_type } =
    deliveryRequest

  //TODO: Replace this with the formular for calculating distance from the demo
  const distance = await calculateDistanceService(
    pickupLocation,
    dropoffLocation
  )
  if (distance) {
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
  } else {
    return null
  }
}

export const zoneToZoneCostService = async (
  pickupZone: string,
  dropoffZone: string
) => {
  const zones = await Zones.find({})

  const zoneToZoneKey = `${pickupZone}-${dropoffZone}`
  const interZoneCost = ZONE_TO_ZONE_COST[zoneToZoneKey] || 0

  return interZoneCost
}

export const deliveryCostService = async (
  deliveryRequest: DeliveryRequestBody
): Promise<number> => {
  const { pickupLocation, dropoffLocation, pickupZone, dropoffZone } =
    deliveryRequest

  // Get Zone Details for Pickup and Dropoff Locations
  const pickupZoneDetails = await getZoneDetailsFromLocation(pickupLocation)
  const dropoffZoneDetails = await getZoneDetailsFromLocation(dropoffLocation)

  // Calculate Costs
  const pickupToDropoffCost = await locationToZoneCostService(deliveryRequest)
  const zonesCost = await zoneToZoneCostService(
    pickupZoneDetails.zoneName,
    dropoffZoneDetails.zoneName
  )

  // Assuming function to calculate cost from dropoff zone back to pickup location, if needed
  // const dropoffToPickupCost = await locationToZoneCostService({ ...deliveryRequest, pickupLocation: dropoffLocation, dropoffLocation: pickupLocation });

  // Total Cost Calculation
  const totalCost = (pickupToDropoffCost || 0) + zonesCost // + dropoffToPickupCost if applicable

  return totalCost
}

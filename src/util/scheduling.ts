//@ts-ignore
import * as isGeoPointInPolygon from 'geo-point-in-polygon'
import { distanceTo } from 'geolocation-utils'
import UserModel from '../models/users/user'
import Delivery from '../models/Delivery'
import Zone from '../models/Zone'
import db from './db'

const ZONES: any[] = []
const PARTNERS: any[] = []

/* 
    For this issue--scheduling of handlers--the order of operation should be:
    1. Determine where the pick up and drop-off zones are.
    2. Check if the handlers in those zones are available.
    3. If they are not, then check the drivers in the next zone. For the case
       when there is no handler, set it to the admin. S/he should look for one
       and assign it to the delivery.
    4. Determine the people in the list and move them in order.     
*/

type Zone = /*unresolved*/ any
type IDelivery = /*unresolved*/ any

export const getZone = async (location: {
  latitude?: number
  longitude?: number
  lat?: number
  lng?: number
}): Promise<string | undefined> => {
  const latitude = location.latitude || location.lat
  const longitude = location.longitude || location.lng

  for (const zone of ZONES) {
    if (isGeoPointInPolygon([longitude, latitude], zone.coordinates)) {
      return zone.name
    }
  }
}

export const getPartner = async (location: {
  latitude: number
  longitude: number
}): Promise<string | undefined> => {
  const latitude = location.latitude
  const longitude = location.longitude

  for (const partner of PARTNERS) {
    if (isGeoPointInPolygon([longitude, latitude], partner.coordinates)) {
      return partner.name
    }
  }
}

export const getHandler = async (location: {
  latitude: number
  longitude: number
}): Promise<string> => {
  const zones: any[] = [] // Define the type of elements in zones if known
  const zoneHandlers: { [key: string]: any[] } = {} // Define the type for zoneHandlers if known

  const zone = getZone(location)
  //@ts-ignore
  const handlers = zone ? zoneHandlers[zone] : []

  for (const handler of handlers) {
    const userDoc = await UserModel.findById(handler).exec()
    if (userDoc && userDoc.canDeliver) {
      return handler
    }
  }

  return 'admin'
}

export const assignHandler = async (location: LocationData): Promise<any> => {
  if (!location) {
    return {
      success: false,
      message: `Can't pick-up nor drop a package at an unknown location.`,
    }
  }

  const zones = await Zone.find({})

  let distanceToLocationFromZoneCenter
  let prevDistance
  let zoneHandlers
  let zoneName
  let handlerId

  for (const zone of zones) {
    try {
      distanceToLocationFromZoneCenter = distanceTo(
        {
          lat: zone.centralLocation.latitude,
          lon: zone.centralLocation.longitude,
        },
        {
          lat: location.geometry.location.lat,
          lon: location.geometry.location.lng,
        }
      )

      if (
        prevDistance === undefined ||
        distanceToLocationFromZoneCenter <= prevDistance
      ) {
        prevDistance = distanceToLocationFromZoneCenter
        zoneName = zone.zoneName
        zoneHandlers = zone.zoneHandlers
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      }
    }
  }

  if (!zoneHandlers) {
    return {
      success: false,
      message: `Can't deliver to your location.`,
    }
  }

  try {
    for (const [index, zoneHandler] of zoneHandlers.entries()) {
      if (zoneHandler.available) {
        handlerId = zoneHandler.id
        zoneHandlers.splice(index, 1)
        zoneHandlers.push(zoneHandler)
        // Update the database for each zone handler
        await db.zones.updateOne(
          { zoneName },
          { $set: { zoneHandlers: zoneHandlers } }
        )
        break // Exit loop once a handler is found and scheduled
      }
    }
  } catch (error: any) {
    return { success: false, message: error.message }
  }

  return {
    success: true,
    body: {
      handlerId: handlerId ? handlerId : undefined,
    },
    message: `Handler successfully scheduled to pick up a package.`,
  }
}

export const getDeliveryCostDetails = async (
  zones: any[],
  location: { latitude: number; longitude: number }
): Promise<any> => {
  let distanceToLocationFromZoneCenter
  let prevDistance
  let zoneName
  let cost

  for (const zone of zones) {
    distanceToLocationFromZoneCenter = distanceTo(
      {
        lat: zone.centralLocation.latitude,
        lon: zone.centralLocation.longitude,
      },
      {
        lat: location.latitude,
        lon: location.longitude,
      }
    )

    if (
      prevDistance === undefined ||
      distanceToLocationFromZoneCenter <= prevDistance
    ) {
      prevDistance = distanceToLocationFromZoneCenter
      zoneName = zone.zoneName
      cost =
        Math.round((zone.rate * distanceToLocationFromZoneCenter) / 1000000) *
        1000
    }
  }

  return {
    zoneName,
    cost,
  }
}

//DRIVER
export const getAvailableDriverService = async (
  location: Location
): Promise<string | undefined> => {
  const zones: Zone[] = await Zone.find({})
  let closestZone: Zone | undefined

  //TODO: Implement closest driver logic by checking drivers within the zone and then checking for shortest distance
  for (const zone of zones) {
    // Your logic to find the closest or appropriate zone based on location
  }

  if (!closestZone) return undefined

  const availableDrivers: any = await UserModel.find({
    _id: { $in: closestZone.zoneHandlers },
    driverStatus: 'active',
  }).exec()

  return availableDrivers.length > 0 ? availableDrivers[0]._id : undefined
}

// Adjust the parameter types as needed, perhaps to include more detailed location information
async function assignDriverToDeliveryService(
  deliveryId: string,
  location: any
): Promise<IDelivery | null> {
  try {
    const driverId = await getAvailableDriverService(location)

    if (!driverId) {
      console.error('No available drivers found')
      return null
    }

    const updatedDelivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      {
        $set: { driverId: driverId, status: 'Driver Assigned' }, // Update the status accordingly
      },
      { new: true }
    ).exec()

    return updatedDelivery
  } catch (error) {
    console.error('Error assigning driver to delivery:', error)
    return null
  }
}

const scheduling = {
  getZone,
  getPartner,
  getHandler,
  assignHandler,
  getDeliveryCostDetails,
  assignDriverToDeliveryService,
}
export default scheduling

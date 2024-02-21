import Zone from '../models/Zone'
import db from '../util/db'
import { distanceTo } from 'geolocation-utils'
import { getDeliveryCostDetails } from '../util/scheduling'
import { calculateDistanceService } from './deliveryDistanceService'

export const getAllZonesService = async () => {
  try {
    const zones = await Zone.find()
    return zones
  } catch (error: any) {
    throw new Error('Failed to retrieve zone', error.message)
  }
}

export const registerZoneService = async (
  zoneName: string,
  rate: number,
  centralLocation: { longitude: number; latitude: number }
) => {
  const existingZone = await db.zones.findOne({ zoneName: zoneName })
  if (existingZone) {
    throw new Error(`Zone ${zoneName} already exists.`)
  }

  const zone = new Zone({
    zoneName,
    rate,
    zoneHandlers: [],
    centralLocation,
  })

  await zone.save()

  return zoneName
}

export const updateZoneInfoService = async (zoneName: string, rate: number) => {
  const zone = await Zone.findOne({ zoneName })

  if (!zone) {
    throw new Error(`Invalid zone name: No zone is named ${zoneName}.`)
  }

  await db.zones.updateOne({ zoneName }, { $set: { zoneName, rate } })
}

export const deleteZoneService = async (zoneName: string) => {
  const zone = await db.zones.findOne({ zoneName })

  if (!zone) {
    throw new Error(
      `Can't delete a non-existent zone: No zone is named ${zoneName}.`
    )
  }

  await db.zones.deleteOne({ zoneName })
}

export const addZoneHandlerService = async (
  zoneName: string,
  handlerUsername: string
) => {
  const zone = await db.zones.findOne({ zoneName })

  if (!zone) {
    throw new Error(`Invalid zone name: No zone is named ${zoneName}.`)
  }

  const user = await db.users.findOne({ username: handlerUsername })

  if (!user) {
    throw new Error(`${handlerUsername} is not a registered user.`)
  }

  if (
    user.status.toLowerCase() === 'vendor' ||
    user.status.toLowerCase() === 'consumer'
  ) {
    throw new Error(`${handlerUsername} is not registered as a driver nor CPP.`)
  }

  await db.zones.updateOne(
    { zoneName },
    {
      $push: {
        zoneHandlers: {
          $each: [{ id: user._id, available: false }],
        },
      },
    }
  )
}

export const deleteZoneHandlerService = async (
  zoneName: string,
  handlerUsername: string
) => {
  const zone = await db.zones.findOne({ zoneName })

  if (!zone) {
    throw new Error(`Invalid zone name: No zone is named ${zoneName}.`)
  }

  const user = await db.users.findOne({ username: handlerUsername })

  if (!user) {
    throw new Error(
      `${handlerUsername} is not a registered--can't delete an unregistered user.`
    )
  }

  await db.zones.updateOne(
    { zoneName },
    { $pull: { zoneHandlers: { id: user._id } } }
  )
}

export const updateZoneHandlerAvailabilityService = async (
  handlerUsername: string,
  available: boolean
) => {
  const user = await db.users.findOne({ username: handlerUsername })

  if (!user || !user._id) {
    throw new Error(
      `${handlerUsername} is not a registered--can't update availability of an unregistered user.`
    )
  }

  await db.zones.updateMany(
    { 'zoneHandlers.id': user._id },
    { $set: { 'zoneHandlers.$.available': available } }
  )
}

export const assignHandlerService = async (location: {
  latitude: number
  longitude: number
}) => {
  if (!location) {
    throw new Error(`Can't pick-up nor drop a package at an unknown location.`)
  }

  const zones = await Zone.find({})
  let closestZone: any = null //TODO: Fix this type
  let minimumDistance = Number.MAX_VALUE

  zones.forEach((zone) => {
    const distance = distanceTo(
      {
        lat: zone.centralLocation.latitude,
        lon: zone.centralLocation.longitude,
      },
      location
    )

    if (distance < minimumDistance) {
      closestZone = zone
      minimumDistance = distance
    }
  })

  if (!closestZone || !closestZone.zoneHandlers) {
    throw new Error(`Can't deliver to your location.`)
  }

  let handlerId
  for (let i = 0; i < closestZone.zoneHandlers.length; i++) {
    const handler = closestZone.zoneHandlers[i]
    if (handler.available) {
      handlerId = handler.id
      closestZone.zoneHandlers.splice(i, 1)
      closestZone.zoneHandlers.push(handler)
      await db.zones.updateOne(
        { zoneName: closestZone.zoneName },
        { $set: { zoneHandlers: closestZone.zoneHandlers } }
      )
      break
    }
  }

  return handlerId
}

// Revised determineClosestZoneService function that uses calculateDistanceService
export async function determineClosestZoneService(
  coordinates: [number, number]
): Promise<string> {
  console.log('Getting closest zone')
  let minDistance = Infinity
  let closestZone = ''

  type LocationDetails = {
    geometry: {
      location: {
        lat: number
        lng: number
      }
    }
  }

  console.log('Location coordinate: ', coordinates)

  // Convert coordinates to the expected LocationDetails format
  const locationDetails: LocationDetails = {
    geometry: {
      location: {
        lat: coordinates[0],
        lng: coordinates[1],
      },
    },
  }

  // Fetch all zones to pass their centers to the service
  const zones = await getAllZonesService()
  const zoneCenters: Record<string, [number, number]> = zones.reduce(
    (acc: any, zone: any) => {
      acc[zone.zoneName] = [
        zone.centralLocation.latitude,
        zone.centralLocation.longitude,
      ]
      return acc
    },
    {}
  )

  //checking all the available zones and comparing their distance to the requested distance
  for (const [zone, center] of Object.entries(zoneCenters)) {
    // Convert each zone center to the expected LocationDetails format
    const centerDetails: LocationDetails = {
      geometry: {
        location: {
          lat: center[0],
          lng: center[1],
        },
      },
    }

    console.log('Center Location ', centerDetails, 'Zone Location: ', zone)
    // Since calculateDistanceService is async, use await to get the result
    const distance = await calculateDistanceService(
      locationDetails,
      centerDetails
    )
    if (distance) {
      if (distance < minDistance) {
        console.log('Min Distance', minDistance)
        minDistance = distance
        closestZone = zone
      }
    }
  }

  return closestZone
}

import { Request, Response } from 'express'
import {
  getAllZonesService,
  registerZoneService,
  updateZoneInfoService,
  deleteZoneService,
  addZoneHandlerService,
  deleteZoneHandlerService,
  updateZoneHandlerAvailabilityService,
  assignHandlerService,
  determineClosestZoneService,
} from '../services/zoneService'
import { calculateDeliveryCostService } from '../services/deliveryCostService'

export const getAllZonesController = async (req: Request, res: Response) => {
  try {
    const zones = await getAllZonesService()
    res.json({
      success: true,
      body: zones,
      message: 'All zones retrieved successfully.',
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getClosestZoneController = async (req: Request, res: Response) => {
  try {
    const { location } = req.body

    if (
      !location ||
      typeof location.latitude !== 'number' ||
      typeof location.longitude !== 'number'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid location data. Please provide latitude and longitude.',
      })
    }

    // Convert the request's location data into the format expected by the service
    const coordinates: [number, number] = [
      location.latitude,
      location.longitude,
    ]

    // Determine the closest zone
    const closestZone = await determineClosestZoneService(coordinates)

    // Respond with the closest zone name
    res.json({
      success: true,
      closestZone: closestZone,
      message: 'Closest zone determined successfully.',
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const registerZoneController = async (req: Request, res: Response) => {
  try {
    const { zoneName, rate, centralLocation } = req.body

    if (
      !zoneName ||
      !rate ||
      !centralLocation.longitude ||
      !centralLocation.latitude
    ) {
      return res.status(400).json({
        success: false,
        message:
          'A Zone should at-least have a name, transportation rate greater than 0, and valid central location.',
      })
    }

    const zoneNameResult = await registerZoneService(
      zoneName,
      rate,
      centralLocation
    )
    res.json({
      success: true,
      message: `${zoneNameResult} zone is added successfully.`,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateZoneInfoController = async (req: Request, res: Response) => {
  try {
    const { zoneName, rate } = req.body

    if (!zoneName || zoneName === '') {
      return res.status(400).json({
        success: false,
        message: 'A Zone should at-least have a name.',
      })
    }

    if (!rate || rate <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Transportation rate should be greater than 0.',
      })
    }

    await updateZoneInfoService(zoneName, rate)
    res.json({
      success: true,
      message: `Zone ${zoneName}'s info is updated successfully.`,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const deleteZoneController = async (req: Request, res: Response) => {
  try {
    const { zoneName } = req.body

    if (!zoneName || zoneName === '') {
      return res.status(400).json({
        success: false,
        message: 'A Zone should at-least have a name.',
      })
    }

    await deleteZoneService(zoneName)
    res.json({
      success: true,
      message: `Zone ${zoneName} is deleted successfully.`,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const addZoneHandlerController = async (req: Request, res: Response) => {
  try {
    const { zoneName, handler } = req.body

    if (!zoneName || zoneName === '') {
      return res.status(400).json({
        success: false,
        message: 'A Zone should at-least have a name.',
      })
    }

    if (!handler) {
      return res.status(400).json({
        success: false,
        message: 'Cannot have an empty handler',
      })
    }

    await addZoneHandlerService(zoneName, handler)
    res.json({
      success: true,
      message: `${handler} is successfully added as a handler in zone ${zoneName}.`,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const deleteZoneHandlerController = async (
  req: Request,
  res: Response
) => {
  try {
    const { zoneName, handler } = req.body

    if (!zoneName || zoneName === '') {
      return res.status(400).json({
        success: false,
        message: 'A Zone should at-least have a name.',
      })
    }

    if (!handler) {
      return res.status(400).json({
        success: false,
        message: 'Cannot have an empty handler',
      })
    }

    await deleteZoneHandlerService(zoneName, handler)
    res.json({
      success: true,
      message: `Handler ${handler} is successfully deleted as a ${zoneName} zone handler.`,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateZoneHandlerAvailabilityController = async (
  req: Request,
  res: Response
) => {
  try {
    const { handler, available } = req.body

    if (!handler) {
      return res.status(400).json({
        success: false,
        message: 'Cannot have an empty handler',
      })
    }

    await updateZoneHandlerAvailabilityService(handler, available)
    res.json({
      success: true,
      message: `Handler ${handler}'s availability updated successfully.`,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const assignHandlerController = async (req: Request, res: Response) => {
  try {
    const { location } = req.body
    const handlerId = await assignHandlerService(location)

    res.json({
      success: true,
      body: { handlerId },
      message: handlerId
        ? `Handler successfully scheduled to pick up a package.`
        : `No available handler found.`,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const deliveryCostController = async (req: Request, res: Response) => {
  try {
    const deliveryRequest = req.body

    if (!deliveryRequest) {
      return res.status(400).json({
        success: false,
        message: 'Delivery Request body must be provided',
      })
    }

    const costDetails = await calculateDeliveryCostService(deliveryRequest)
    res.json({
      success: true,
      body: costDetails,
      message: `Cost details calculated successfully.`,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

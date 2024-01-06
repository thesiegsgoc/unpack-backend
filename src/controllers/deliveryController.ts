import Cryptr from 'cryptr'
import DeliveryModel from '../models/DeliveryOrderSchemal'
import { Request, Response } from 'express'
import * as DeliveryServices from '../services/deliveryService'
import WebSocketService from '../websocket/websocketService'
import { IDeliveryOrder } from '../types/delivery'

export const createDeliveryController = async (
  req: Request<{ senderId: string }, {}, IDeliveryOrder>,
  res: Response
) => {
  try {
    const deliveryData = req.body
    const senderId = req.params.senderId
    const result = await DeliveryServices.createDeliveryOrderService(
      deliveryData,
      senderId
    )
    return res.json({
      success: true,
      message: 'Delivery ordered successfully',
      delivery: result,
      trackingNumber: result.deliveryId,
    })
  } catch (error: any) {
    return res.json({ success: false, message: error.message })
  }
}

export const updateDeliveryController = async (
  req: Request<{}, {}, IDeliveryOrder>,
  res: Response
) => {
  try {
    const deliveryData = req.body
    const result = await DeliveryServices.updateDeliveryService(deliveryData)
    return res.json({
      success: true,
      delivery: result,
      message: 'Delivery updated successfully',
    })
  } catch (error: any) {
    return res.json({ success: false, message: error.message })
  }
}

export const updateDeliveryStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const { deliveryId, newStatus } = req.body // Assuming newStatus is sent in the request body

    // Additional validations can be performed here

    const result = await DeliveryServices.updateDeliveryOrderStatuService(
      deliveryId,
      newStatus
    )
    return res.json({
      success: true,
      delivery: result,
      message: 'Delivery status updated successfully',
    })
  } catch (error: any) {
    return res.json({ success: false, message: error.message })
  }
}

export const encryptDeliveryDetailsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { deliveryIds } = req.body
    const encryptedDetails =
      await DeliveryServices.encryptDeliveryDetailsService(deliveryIds)
    return res.json({
      success: true,
      body: encryptedDetails,
      message: 'Delivery details have been encrypted successfully.',
    })
  } catch (error: any) {
    return res.json({ success: false, message: error.message })
  }
}

export const trackDeliveryController = async (req: Request, res: Response) => {
  try {
    const { trackingId } = req.params
    const trackingDetails = await DeliveryServices.trackDeliveryService(
      trackingId
    )

    return res.json({
      success: true,
      body: trackingDetails,
      message: 'Tracking details retrieved successfully.',
    })
  } catch (error: any) {
    return res.json({ success: false, message: error.message })
  }
}

export const getAllDeliveriesController = async (
  req: Request,
  res: Response
) => {
  try {
    const allDeliveries = await DeliveryServices.getAllDeliveriesService()

    return res.json({
      success: true,
      body: allDeliveries,
      message: 'All delivery details retrieved successfully.',
    })
  } catch (error: any) {
    return res.json({ success: false, message: error.message })
  }
}

export const getUserDeliveryHistoryController = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  try {
    const { userId } = req.body
    const deliveryHistory =
      await DeliveryServices.getUserDeliveryHistoryService(userId)

    return res.json({
      success: true,
      body: deliveryHistory,
      message: "User's delivery history retrieved successfully.",
    })
  } catch (error: any) {
    return res.json({ success: false, message: error.message })
  }
}

export const getPartnerDeliveryHistoryController = async (
  req: Request<{ partnerId: string }>,
  res: Response
) => {
  try {
    const { partnerId } = req.body
    // const deliveryHistory =
    //   await DeliveryServices.getPartnerDeliveryHistoryService(partnerId)

    return res.json({
      success: true,
      // body: deliveryHistory,
      message: 'Delivery history retrieved successfully.',
    })
  } catch (error: any) {
    return res.json({ success: false, message: error.message })
  }
}

export const getDeliveryIdsController = async (
  req: Request<{}, {}, IDeliveryOrder>,
  res: Response
) => {
  try {
    const { deliveryId } = req.body
    const encryptedDeliveryIds = await DeliveryServices.getDeliveryIdsService(
      deliveryId!
    )

    return res.json({
      success: true,
      body: encryptedDeliveryIds,
      message: 'Delivery details have been encrypted successfully.',
    })
  } catch (error: any) {
    return res.json({ success: false, message: error.message })
  }
}

export const pickupDeliveryController = async (req: Request, res: Response) => {
  try {
    const { encryptedData, partnerId } = req.body
    const result = await DeliveryServices.pickupDeliveryService(
      encryptedData,
      partnerId
    )

    return res.json(result)
  } catch (error: any) {
    return res.json({ success: false, message: error.message })
  }
}

export const getHandlersLocationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { scheduledHandler } = req.body
    const handlerLocation = await DeliveryServices.getHandlersLocationService(
      scheduledHandler
    )

    return res.json({
      success: true,
      body: { handlerLocation },
      message: 'Handlers location retrieved successfully.',
    })
  } catch (error: any) {
    return res.json({ success: false, message: error.message })
  }
}

export const deliveryCostController = async (req: Request, res: Response) => {
  try {
    const { pickUpLocation, dropOffLocation, deliveryType } = req.body

    if (!pickUpLocation || !dropOffLocation || !deliveryType) {
      return res.status(400).json({
        success: false,
        message: `Can't pick-up nor drop a package at an unknown location.`,
      })
    }

    // const costDetails = await deliveryCostService(
    //   pickUpLocation,
    //   dropOffLocation,
    //   deliveryType
    // )
    res.json({
      success: true,
      // body: costDetails,
      message: `Cost details calculated successfully.`,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const currentDriversLocationController = async (
  req: Request,
  res: Response
) => {
  const { driverId, location } = req.body
  try {
    await DeliveryServices.updateDriversLocationService(driverId, location)
    res.status(200).send('Location updated successfully')
  } catch (error: any) {
    res.status(500).send(error.message)
  }
}

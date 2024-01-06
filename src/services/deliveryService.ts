import Cryptr from 'cryptr'
import UserModel from '../models/users/user'
import scheduling from '../util/scheduling'
import db from '../util/db'
import PartnerModel from '../models/Partner'
import WebSocketService from '../websocket/websocketService'
import { IDeliveryOrder, ILocation } from '../types/delivery'
import { Request, Response } from 'express'
import DeliveryModel from '../models/DeliveryOrderSchemal'

const cryptr = new Cryptr('myTotallySecretKey')

// Define additional interfaces if needed
interface DeliveryDetailsFrom {
  phone: string
  email: string
  pickup: ILocation
}

interface DeliveryDetailsTo {
  receiver: string
  phonenumber: string
  dropoff: ILocation
}

interface DeliveryDetailsFrom {
  phone: string
  email: string
  pickup: ILocation
}

interface DeliveryDetailsTo {
  receiver: string
  phonenumber: string
  dropoff: ILocation
}

export const createDeliveryOrderService = async (
  deliveryOrderData: IDeliveryOrder,
  senderId: string
) => {
  try {
    const numbCurrentDeliveries = await db.deliveries.countDocuments()
    // Create a new delivery order
    const newDeliveryOrder = new DeliveryModel({
      ...deliveryOrderData,
      deliveryId: `D00${numbCurrentDeliveries + 1}`,
      senderId,
      status: 'pending',
    })

    // Save the delivery order to the database
    const savedDeliveryOrder = await newDeliveryOrder.save()

    // Return the saved delivery order
    return savedDeliveryOrder
  } catch (error: any) {
    console.error('Error creating delivery order:', error.message)
    throw error
  }
}

export const updateDeliveryOrderStatuService = async (
  deliveryId: string,
  newStatus: string
) => {
  try {
    const delivery = await DeliveryModel.findOne({ deliveryId })
    if (!delivery) {
      throw new Error(`Delivery with ID ${deliveryId} not found.`)
    }

    //TODO: Additional business logic can be implemented here
    // - Checking if the status transition is valid.
    // - Notifying users or drivers about the status change.

    delivery.status = { value: newStatus, updatedAt: new Date() }
    await delivery.save()

    return delivery
  } catch (error: any) {
    console.error('Error updating delivery status:', error.message)
    throw error
  }
}

export const updateDeliveryService = async (
  deliveryData: IDeliveryOrder
): Promise<IDeliveryOrder | null> => {
  try {
    // Ensure the deliveryData includes the deliveryId
    const { deliveryId } = deliveryData
    if (!deliveryId) {
      throw new Error('Delivery ID is required for updating.')
    }

    // Find the existing delivery record in the database
    const existingDelivery = await DeliveryModel.findOne({ deliveryId })

    if (!existingDelivery) {
      throw new Error(`Delivery with ID ${deliveryId} not found.`)
    }

    // Update the existing delivery record with the new data
    const updatedDelivery = await DeliveryModel.findOneAndUpdate(
      { deliveryId },
      { $set: deliveryData },
      { new: true } // Return the updated document
    )
    return updatedDelivery
  } catch (error: any) {
    console.error('Error updating delivery:', error.message)
    throw error
  }
}

export const encryptDeliveryDetailsService = async (deliveryIds: string[]) => {
  if (!deliveryIds || deliveryIds.length === 0) {
    throw new Error('No delivery IDs provided.')
  }

  const deliveryDetails: {
    from: DeliveryDetailsFrom
    to: DeliveryDetailsTo
    shipper: string
    notes?: string
  }[] = []

  await Promise.all(
    deliveryIds.map(async (deliveryId: string) => {
      const delivery = await DeliveryModel.findById(deliveryId)
        .populate('senderId')
        .populate('receiverId')
        .populate('scheduledDriver')

      if (!delivery) {
        throw new Error(`Invalid delivery data for ID: ${deliveryId}`)
      }

      const sender = delivery.senderId as IUser // Assuming IUser is the user interface
      const receiver = delivery.receiverId as IUser // Similarly for receiver

      // deliveryDetails.push({
      //   from: {
      //     phone: sender.phone,
      //     email: sender.email,
      //     pickup: delivery.pickupLocation,
      //   },
      //   to: {
      //     receiver: receiver.fullname,
      //     phonenumber: receiver.phone,
      //     dropoff: delivery.dropoffLocation,
      //   },
      //   shipper: delivery.scheduledDriver.toString(),
      //   notes: delivery.notes,
      // })
    })
  )

  const encryptedDetails = cryptr.encrypt(
    JSON.stringify({
      deliveryDetails,
      access: [
        'admin',
        ...deliveryIds,
        ...deliveryDetails.map((detail) => detail.shipper),
      ],
    })
  )

  return encryptedDetails
}

export const trackDeliveryService = async (trackingId: string) => {
  const delivery: IDeliveryOrder | null = await DeliveryModel.findOne({
    deliveryId: trackingId,
  })

  if (!delivery) {
    throw new Error('Provide a valid order ID.')
  }

  const { scheduledDriver, status, pickupLocation, dropoffLocation } = delivery
  const handlerDetails = await UserModel.findById(scheduledDriver)

  if (!handlerDetails) {
    throw new Error('Handler details not found.')
  }

  const { fullname, rating, profilePhoto } = handlerDetails // assuming these fields exist in your user model

  // Check the delivery status
  if (status?.value === 'cancelled') {
    throw new Error('This order was cancelled. Cannot track it.')
  }

  if (status?.value === 'delivered') {
    throw new Error(
      'This order is already delivered. Cannot track it. Check your order history for more info.'
    )
  }

  return {
    pickupLocation,
    dropoffLocation,
    handlerName: fullname,
    handlerRating: rating,
    handlerProfilePhoto: profilePhoto,
    scheduledDriver,
  }
}

export const getAllDeliveriesService = async () => {
  try {
    const deliveries: IDeliveryOrder[] = await DeliveryModel.find({})

    if (!deliveries || deliveries.length === 0) {
      throw new Error('No deliveries found.')
    }

    // Mapping the deliveries to return a simplified or specific structure
    const mappedDeliveries = deliveries.map((delivery) => {
      return {
        deliveryId: delivery.deliveryId,
        senderId: delivery.senderId,
        receiverId: delivery.receiverId,
        scheduledDriver: delivery.scheduledDriver,
        packageSize: delivery.packageSize,
        quantity: delivery.quantity,
        type: delivery.type,
        parcel: delivery.parcel,
        dropoffLocation: delivery.dropoffLocation,
        pickupLocation: delivery.pickupLocation,
        currentHandler: delivery.currentHandler,
        pickupDate: delivery.pickupDate,
        deliveryDate: delivery.deliveryDate,
        dropOffCost: delivery.dropOffCost,
        pickUpCost: delivery.pickUpCost,
        deliveryCost: delivery.deliveryCost,
        name: delivery.name,
        notes: delivery.notes,
        status: delivery.status,
        // Add more fields as required
      }
    })

    return mappedDeliveries
  } catch (error: any) {
    throw new Error(`Error fetching deliveries: ${error.message}`)
  }
}

export const getUserDeliveryHistoryService = async (userId: string) => {
  const user = await UserModel.findById(userId).populate('deliveries')

  if (!user || !user.deliveries?.length) {
    throw new Error('User not found or has no delivery history.')
  }

  const deliveryList: IDeliveryOrder[] = []

  for (const deliveryId of user.deliveries) {
    const deliveryItem = await DeliveryModel.findById(deliveryId)

    if (!deliveryItem) {
      console.error(`Delivery data missing for ID: ${deliveryId}`)
      continue
    }

    const sender = await UserModel.findById(deliveryItem.senderId)

    // deliveryList.push({
    //   deliveryId: deliveryItem.deliveryId,
    //   receiverId: deliveryItem.receiverId,
    //   senderId: deliveryItem.senderId,
    //   scheduledDriver: deliveryItem.scheduledDriver,
    //   packageSize: deliveryItem.packageSize,
    //   quantity: deliveryItem.quantity,
    //   type: deliveryItem.type,
    //   parcel: deliveryItem.parcel,
    //   dropoffLocation: deliveryItem.dropoffLocation,
    //   pickupLocation: deliveryItem.pickupLocation,
    //   currentHandler: deliveryItem.currentHandler,
    //   pickupDate: deliveryItem.pickupDate,
    //   deliveryDate: deliveryItem.deliveryDate,
    //   dropOffCost: deliveryItem.dropOffCost,
    //   pickUpCost: deliveryItem.pickUpCost,
    //   deliveryCost: deliveryItem.deliveryCost,
    //   name: deliveryItem.name,
    //   notes: deliveryItem.notes,
    //   status: deliveryItem.status,
    //   // Additional fields from IDeliveryOrder
    //   senderInfo: sender
    //     ? {
    //         fullname: sender.fullname,
    //         expoPushToken: sender.expoPushToken,
    //       }
    //     : undefined,
    // })
  }

  return deliveryList
}

export const getDeliveryIdsService = async (userId: string) => {
  if (!userId) {
    throw new Error('Provide user ID.')
  }

  const user = await UserModel.findById({ _id: userId })
  if (!user) {
    throw new Error('User not found.')
  }

  let deliveries: IDeliveryOrder[] = []

  if (user.status === 'vendor' || user.status === 'consumer') {
    deliveries = await DeliveryModel.find({ senderId: userId }).exec()
  }
  // Include other conditions if necessary

  if (!deliveries || deliveries.length === 0) {
    throw new Error('No deliveries from the user.')
  }

  let deliveryIds = deliveries.map((delivery) => delivery.deliveryId)

  const encryptedDeliveries = cryptr.encrypt(
    JSON.stringify({
      deliveryIds,
      access: [userId, 'admin'],
    })
  )

  return encryptedDeliveries
}

export const pickupDeliveryService = async (
  encryptedData: string,
  partnerId: string
) => {
  if (!partnerId) {
    throw new Error('Cannot be picked-up without a partner.')
  }

  if (!encryptedData) {
    throw new Error('Cannot decrypt undefined data.')
  }

  const partner = await UserModel.findById({ _id: partnerId })

  if (!partner) {
    throw new Error('You do not have authorization to read this data.')
  }

  const decryptedData = cryptr.decrypt(encryptedData)
  const deliveryData = JSON.parse(decryptedData)

  if (deliveryData.length === 0) {
    return { success: true, message: 'No package to pick up.' }
  }

  // let deliveryIds = []

  // for (const deliveryId of deliveryData.deliveryIds) {
  //   const delivery = await DeliveryModel.findOne({ deliveryId })

  //   if (delivery && delivery.scheduledHandler === partnerId) {
  //     await db.deliveries.updateOne(
  //       { deliveryId },
  //       {
  //         $set: {
  //           currentHandler: {
  //             id: partnerId,
  //             time: `${new Date().toISOString()}`,
  //           },
  //         },
  //         $push: {
  //           pickedUpFrom: {
  //             $each: [
  //               {
  //                 id: deliveryData.access[0],
  //                 time: `${new Date().toISOString()}`,
  //               },
  //             ],
  //           },
  //         },
  //       }
  //     )
  //     deliveryIds.push(deliveryId)
  //   }
  // }

  return {
    success: true,
    // deliveryIds,
    message: 'Package pickup process finished successfully.',
  }
}

export const getHandlersLocationService = async (scheduledHandler: string) => {
  if (!scheduledHandler) {
    throw new Error('Provide valid handler id.')
  }

  const handler = await UserModel.findById(scheduledHandler)

  if (!handler) {
    throw new Error('Handler does not exist.')
  }

  return handler.location
}

export const deliveryCostService = async (
  pickUpLocation: any,
  dropOffLocation: any,
  deliveryType: string
) => {
  // const zones = await Zone.find({})
  // const pickUpCostDetails = getDeliveryCostDetails(zones, pickUpLocation)
  // const dropOffCostDetails = getDeliveryCostDetails(zones, dropOffLocation)
  // //@ts-ignore
  // const zoneToZoneKey = `${pickUpCostDetails.zoneName}-${dropOffCostDetails.zoneName}`
  // const interZoneCost = ZONE_TO_ZONE_COST[zoneToZoneKey] || 0
  // //@ts-ignore
  // const totalCost =
  //   pickUpCostDetails.cost + dropOffCostDetails.cost + interZoneCost
  // return {
  //   //@ts-ignore
  //   pickUpCost: pickUpCostDetails.cost,
  //   //@ts-ignore
  //   dropOffCost: dropOffCostDetails.cost,
  //   totalCost,
  // }
}

export const updateDriversLocationService = async (
  driverId: string,
  location: { latitude: number; longitude: number }
) => {
  // Update the driver's location in the database
  await DeliveryModel.updateOne(
    { driverId },
    { $set: { currentLocation: location } }
  )

  // Use the WebSocket service to notify relevant users
  const webSocketService = WebSocketService.getInstance()
  webSocketService.updateDriverLocation(driverId, location)
}

//update delivery status once driver completed the session
export const updateDeliveryStatus = async (req: Request, res: Response) => {
  const { sessionId } = req.body

  const updatedSession = await DeliveryModel.findByIdAndUpdate(
    sessionId,
    { status: 'completed', endTime: new Date() },
    { new: true }
  )

  res.status(200).json(updatedSession)
}

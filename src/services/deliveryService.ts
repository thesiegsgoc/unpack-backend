import Cryptr from 'cryptr'
import DeliveryModel from '../models/delivery'
import UserModel from '../models/users/user'
import scheduling from '../util/scheduling'
import db from '../util/db'
import OrderModel from '../models/order'
import PartnerModel from '../models/partner'
const cryptr = new Cryptr('myTotallySecretKey')

type AddDeliveryRequestBody = /*unresolved*/ any // TODO: Define the type for AddDeliveryRequestBody in the types file
type DeliveryDetailsFrom = /*unresolved*/ any
type DeliveryDetailsTo = /*unresolved*/ any
type DeliveryItem = /*unresolved*/ any
type PartnerDeliveryItem = /*unresolved*/ any
type Delivery = /*unresolved*/ any

export const createDeliveryService = async (
  deliveryData: AddDeliveryRequestBody
) => {
  const {
    receiver,
    phoneNumber,
    pickup,
    dropoffLocation,
    senderId,
    size,
    type,
    parcel,
    quantity,
    deliveryTime,
    deliveryDate,
    dropOffCost,
  } = deliveryData

  const numCurrentDeliveries = await db.deliveries.countDocuments()
  const handler = await scheduling.assignHandler(pickup)

  const newDelivery = new DeliveryModel({
    receiver,
    phoneNumber,
    pickup,
    dropoffLocation,
    senderId,
    size,
    type,
    parcel,
    quantity,
    deliveryId: `D00${numCurrentDeliveries + 1}`,
    scheduledHandler: handler.success ? handler.body.handler : undefined,
    deliveryTime,
    deliveryDate,
    dropOffCost,
  })

  await newDelivery.save()

  await UserModel.updateOne(
    { _id: senderId },
    { $push: { deliveries: [`D00${numCurrentDeliveries + 1}`] } }
  )

  if (handler.success && handler.body.handler) {
    await UserModel.updateOne(
      { _id: handler.body.handler },
      { $push: { deliveries: [`D00${numCurrentDeliveries + 1}`] } }
    )
  }

  return { trackingNumber: `D00${numCurrentDeliveries + 1}` }
}

export const updateDeliveryService = async (
  deliveryData: Delivery
): Promise<Delivery | null> => {
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
      const delivery = await DeliveryModel.findOne({ deliveryId })
      const user =
        delivery?.senderId &&
        (await UserModel.findOne({ userId: delivery.senderId }))

      if (!delivery || !user) {
        throw new Error(`Invalid delivery data for ID: ${deliveryId}`)
      }

      deliveryDetails.push({
        from: {
          phone: user.phone,
          email: user.email!,
          pickup: delivery.pickupLocation,
        },
        to: {
          receiver: delivery.receiver!,
          phonenumber: delivery.phoneNumber!,
          dropoff: delivery.dropoffLocation,
        },
        shipper: delivery.scheduledHandler!,
        notes: delivery.notes,
      })
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
  const delivery = await db.deliveries.findOne({ deliveryId: trackingId })

  if (!delivery) {
    throw new Error('Provide a valid order ID.')
  }

  const { scheduledHandler, status, pickup, dropoff } = delivery
  const handlerDetails = await UserModel.findById(scheduledHandler)

  if (!handlerDetails) {
    throw new Error('Handler details not found.')
  }

  const { fullname, username, rating, profilePhoto } = handlerDetails

  if (status.value === 'cancelled') {
    throw new Error('This order was cancelled. Cannot track it.')
  }

  if (status.value === 'delivered') {
    throw new Error(
      'This order is already delivered. Cannot track it. Check your order history for more info.'
    )
  }

  return {
    pickup,
    dropoff,
    handlerName: name,
    handlerRating: rating,
    handlerProfilePhoto: profilePhoto,
    scheduledHandler,
  }
}

export const getAllDeliveriesService = async () => {
  try {
    const deliveries = await DeliveryModel.find({})

    if (!deliveries || deliveries.length === 0) {
      throw new Error('No deliveries found.')
    }

    // Mapping the deliveries to return a simplified or specific structure
    // Modify this as per your application's requirements
    const mappedDeliveries = deliveries.map((delivery) => {
      return {
        deliveryId: delivery.deliveryId,
        senderId: delivery.senderId,
        receiver: delivery.receiver,
        status: delivery.status,
        scheduledHandler: delivery.scheduledHandler,
        pickupLocation: delivery.pickupLocation,
        dropoffLocation: delivery.dropoffLocation,
        deliveryTime: delivery.deliveryTime,
        deliveryDate: delivery.deliveryDate,
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

  const deliveryList: DeliveryItem[] = []

  for (const delivery of user.deliveries) {
    const deliveryItem = await DeliveryModel.findById(delivery)

    if (!deliveryItem) {
      console.error(`Delivery data missing for ID: ${delivery}`)
      continue
    }

    const sender = await UserModel.findById(deliveryItem.senderId)

    deliveryList.push({
      delivery: {
        pickup: deliveryItem.pickupLocation,
        dropoff: deliveryItem.dropoffLocation,
        time: deliveryItem.deliveryTime!,
        date: deliveryItem.deliveryDate!,
        status: deliveryItem.status,
        deliveryId: delivery,
        type: deliveryItem.type!,
        receiver: deliveryItem.receiver!,
        sendor: sender?.fullname,
        expoPushToken: sender?.expoPushToken!,
        dropOffCost: deliveryItem.dropOffCost,
        pickUpCost: deliveryItem.pickUpCost,
        deliveryCost: deliveryItem.deliveryCost!,
      },
      // Additional details can be added here if needed
    })
  }

  return deliveryList
}

export const getPartnerDeliveryHistoryService = async (partnerId: string) => {
  const partner = await PartnerModel.findOne({ partnerId }).populate(
    'deliveries'
  )

  if (!partner || !partner.deliveries?.length) {
    throw new Error('Partner not found or has no delivery history.')
  }

  const deliveryList: PartnerDeliveryItem[] = []

  for (const delivery of partner.deliveries) {
    const deliveryData = await DeliveryModel.findById(delivery)

    if (!deliveryData) {
      console.error(`Delivery data missing for ID: ${delivery}`)
      continue
    }

    const orderData = await OrderModel.findById(deliveryData.orderId)
    const vendorData = await UserModel.findById(deliveryData.vendorId)

    deliveryList.push({
      delivery: {
        pickup: deliveryData.pickupLocation,
        dropoff: deliveryData.dropoffLocation,
        time: deliveryData.deliveryTime!, // Assume deliveryTime is available
        date: deliveryData.deliveryDate!, // Assume deliveryDate is available
        status: deliveryData.status,
        deliveryId: deliveryData.id!, // Assume _id is the deliveryId
        type: deliveryData.type!, // Assume type is available
        receiver: deliveryData.receiver!, // Assume receiver is available
        sendor: deliveryData.senderId, // Assume senderId is available
        expoPushToken: vendorData?.expoPushToken,
        dropOffCost: deliveryData.dropOffCost,
        pickUpCost: deliveryData.pickUpCost,
        deliveryCost: deliveryData.deliveryCost!,
        deliveryTime: deliveryData.deliveryTime!, // Include deliveryTime
      },
      order: {
        name: orderData?.name!,
        parcel: orderData?.parcel!,
        quantity: orderData?.quantity!,
        size: orderData?.size!,
      },
      vendor: {
        fullname: vendorData?.fullname,
        avatar: vendorData?.avatar!,
      },
    })
  }

  return deliveryList
}

export const getDeliveryIdsService = async (userID: string) => {
  if (!userID) {
    throw new Error('Provide user ID.')
  }

  const user = await UserModel.findById({ _id: userID })
  if (!user) {
    throw new Error('User not found.')
  }

  let deliveries: Delivery[] = []

  if (user.status === 'vendor' || user.status === 'consumer') {
    deliveries = await DeliveryModel.find({ senderId: userID }).exec()
  }
  // Include other conditions if necessary

  if (!deliveries || deliveries.length === 0) {
    throw new Error('No deliveries from the user.')
  }

  let deliveryIds = deliveries.map((delivery) => delivery.deliveryId)

  const encryptedDeliveries = cryptr.encrypt(
    JSON.stringify({
      deliveryIds,
      access: [userID, 'admin'],
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

  let deliveryIds = []

  for (const deliveryId of deliveryData.deliveryIds) {
    const delivery = await DeliveryModel.findOne({ deliveryId })

    if (delivery && delivery.scheduledHandler === partnerId) {
      await db.deliveries.updateOne(
        { deliveryId },
        {
          $set: {
            currentHandler: {
              id: partnerId,
              time: `${new Date().toISOString()}`,
            },
          },
          $push: {
            pickedUpFrom: {
              $each: [
                {
                  id: deliveryData.access[0],
                  time: `${new Date().toISOString()}`,
                },
              ],
            },
          },
        }
      )
      deliveryIds.push(deliveryId)
    }
  }

  return {
    success: true,
    deliveryIds,
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

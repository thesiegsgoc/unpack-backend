import Cryptr from 'cryptr'
import DeliveryModel from '../models/Delivery'
import UserModel from '../models/users/user'
import scheduling from '../util/scheduling'
import db from '../util/db'
import OrderModel from '../models/Order'
import PartnerModel from '../models/Partner'
const cryptr = new Cryptr('myTotallySecretKey')

type AddDeliveryRequestBody = /*unresolved*/ any // TODO: Define the delivery_type for AddDeliveryRequestBody in the delivery_types file
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
    pickupLocation,
    dropoffLocation,
    userId,
    size,
    delivery_type,
    parcel,
    delivery_quantity,
    delivery_time,
    delivery_date,
    dropOffCost,
    delivery_cost,
  } = deliveryData

  const numCurrentDeliveries = await db.deliveries.countDocuments()
  const handler = await scheduling.assignHandler(pickupLocation)

  const newDelivery = new DeliveryModel({
    receiver,
    phoneNumber,
    pickupLocation,
    dropoffLocation,
    userId,
    size,
    delivery_type,
    parcel,
    delivery_quantity,
    deliveryId: `D00${numCurrentDeliveries + 1}`,
    scheduled_handler: handler.success ? handler.body.handler : undefined,
    delivery_time,
    delivery_date,
    dropOffCost,
    delivery_cost,
  })

  await newDelivery.save()

  await UserModel.updateOne(
    { userId: userId },
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
        delivery?.userId &&
        (await UserModel.findOne({ userId: delivery.userId }))

      if (!delivery || !user) {
        throw new Error(`Invalid delivery data for ID: ${deliveryId}`)
      }

      deliveryDetails.push({
        from: {
          phone: user.phone!,
          email: user.email!,
          pickup: delivery.pickupLocation!,
        },
        to: {
          receiver: delivery.receiver!,
          phonenumber: delivery.phoneNumber!,
          dropoff: delivery.dropoffLocation,
        },
        shipper: delivery.scheduled_handler!,
        notes: delivery.delivery_notes,
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

  const { scheduled_handler, delivery_status, pickup, dropoff } = delivery
  const handlerDetails = await UserModel.findById(scheduled_handler)

  if (!handlerDetails) {
    throw new Error('Handler details not found.')
  }

  const { fullname, username, rating, profilePhoto } = handlerDetails

  if (delivery_status.value === 'cancelled') {
    throw new Error('This order was cancelled. Cannot track it.')
  }

  if (delivery_status.value === 'delivered') {
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
    scheduled_handler,
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
        userId: delivery.userId,
        receiver: delivery.receiver,
        delivery_status: delivery.delivery_status,
        scheduled_handler: delivery.scheduled_handler,
        pickupLocation: delivery.pickupLocation,
        dropoffLocation: delivery.dropoffLocation,
        delivery_time: delivery.delivery_time,
        delivery_date: delivery.delivery_date,
        // Add more fields as required
      }
    })

    return mappedDeliveries
  } catch (error: any) {
    throw new Error(`Error fetching deliveries: ${error.message}`)
  }
}

export const getDeliveryByIdService = async (deliveryId: string) => {
  try {
    const delivery = await DeliveryModel.findOne({ deliveryId })
    if (!delivery) {
      throw new Error('No deliveries found.')
    }
    return delivery
  } catch (errro: any) {
    throw new Error(`Error fetching delivery ${errro.message}`)
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

    const sender = await UserModel.findById(deliveryItem.userId)

    deliveryList.push({
      delivery: {
        pickup: deliveryItem.pickupLocation,
        dropoff: deliveryItem.dropoffLocation,
        time: deliveryItem.delivery_time!,
        date: deliveryItem.delivery_date!,
        delivery_status: deliveryItem.delivery_status,
        deliveryId: delivery,
        delivery_type: deliveryItem.delivery_type!,
        receiver: deliveryItem.receiver!,
        sendor: sender?.fullname,
        expoPushToken: sender?.expoPushToken!,
        dropOffCost: deliveryItem.drop_off_cost,
        pickUpCost: deliveryItem.pick_up_cost,
        deliveryCost: deliveryItem.delivery_cost!,
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
        pickup: deliveryData.pickupLocation!,
        dropoff: deliveryData.dropoffLocation,
        time: deliveryData.delivery_time!, // Assume delivery_time is available
        date: deliveryData.delivery_date!, // Assume delivery_date is available
        status: deliveryData.delivery_status,
        deliveryId: deliveryData.id!, // Assume _id is the deliveryId
        type: deliveryData.delivery_type!, // Assume delivery_type is available
        receiver: deliveryData.receiver!, // Assume receiver is available
        sendor: deliveryData.userId, // Assume userId is available
        expoPushToken: vendorData?.expoPushToken,
        dropOffCost: deliveryData.drop_off_cost,
        pickUpCost: deliveryData.pick_up_cost,
        deliveryCost: deliveryData.delivery_cost!,
        delivery_time: deliveryData.delivery_time!, // Include delivery_time
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

export const getDeliveryIdsService = async (userId: string) => {
  if (!userId) {
    throw new Error('Provide user ID.')
  }

  const user = await UserModel.findById({ _id: userId })
  if (!user) {
    throw new Error('User not found.')
  }

  let deliveries: Delivery[] = []

  if (user.status === 'vendor' || user.status === 'consumer') {
    deliveries = await DeliveryModel.find({ userId: userId }).exec()
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

  let deliveryIds = []

  for (const deliveryId of deliveryData.deliveryIds) {
    const delivery = await DeliveryModel.findOne({ deliveryId })

    if (delivery && delivery.scheduled_handler === partnerId) {
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

export const getHandlersLocationService = async (scheduled_handler: string) => {
  if (!scheduled_handler) {
    throw new Error('Provide valid handler id.')
  }

  const handler = await UserModel.findById(scheduled_handler)

  if (!handler) {
    throw new Error('Handler does not exist.')
  }

  return handler.location
}

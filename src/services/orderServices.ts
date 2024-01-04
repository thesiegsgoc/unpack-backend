// orderService.ts
import Order from '../models/Order'
import db from '../util/db'

export const createOrder = async (orderData: {
  name: string
  parcel: string
  quantity: number
  size: string
  orderId: string
}) => {
  const newOrder = new Order(orderData)
  await newOrder.save()
  return newOrder
}

export const updateOrder = async (
  orderId: string,
  updateData: Record<string, any>
) => {
  await db.orders.updateOne({ orderId }, { $set: updateData })
}

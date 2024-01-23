// orderService.ts
import db from '../util/db'
import OrderModel from '../models/Order'

export const createOrder = async (orderData: {
  name: string
  parcel: string
  quantity: number
  size: string
  orderId: string
}) => {
  const newOrder = new OrderModel(orderData)
  await newOrder.save()
  return newOrder
}

export const updateOrder = async (
  orderId: string,
  updateData: Record<string, any>
) => {
  await db.orders.updateOne({ orderId }, { $set: updateData })
}

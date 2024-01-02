import { Request, Response } from 'express'
import * as OrderService from '../services/orderServices'

export const addOrder = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, parcel, quantity, size, orderId } = req.body

  if (!name || !parcel || !quantity || !size || !orderId) {
    return res.json({ success: false, message: 'Fill out empty fields.' })
  } else {
    try {
      const newOrder = await OrderService.createOrder({
        name,
        parcel,
        quantity,
        size,
        orderId,
      })
      return res.json({ status: 'OK', data: newOrder })
    } catch (error: any) {
      return res.json({ success: false, message: error.message })
    }
  }
}

export const updateOrderInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { orderId } = req.body

  try {
    await OrderService.updateOrder(orderId, req.body)
    return res.json({
      success: true,
      message: 'Order info has updated successfully.',
    })
  } catch (error: any) {
    return res.json({ success: false, message: error.message })
  }
}

const orderController = { updateOrderInfo, addOrder }
export default orderController

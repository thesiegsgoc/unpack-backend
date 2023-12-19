import Order from "../models/Order"; // Ensure this is a TypeScript compatible model
import db from '../util/db'; // Adjust the import if necessary
import { Request, Response } from 'express';

export const addOrder = async (req: Request, res: Response): Promise<Response> => {
    const { name, parcel, quantity, size, orderId } = req.body;

    if (!name || !parcel || !quantity || !size || !orderId) {
        return res.json({ success: false, message: 'Fill out empty fields.' });
    } else {
        try {
            const newOrder = new Order({
                name,
                parcel,
                quantity,
                size,
                orderId
            });
            await newOrder.save();
            return res.json({ status: 'OK', data: newOrder });
        } catch (error: any) {
            return res.json({ success: false, message: error.message });
        }
    }
};

export const updateOrderInfo = async (req: Request, res: Response): Promise<Response> => {
    const { orderId } = req.body;

    try {
        await db.orders.updateOne(
            { orderId },
            { $set: { ...req.body } }
        );
        return res.json({ success: true, message: 'Order info has updated successfully.' });
    } catch (error: any) {
        return res.json({ success: false, message: error.message });
    }
};

const orderController = { updateOrderInfo, addOrder };
export default orderController;

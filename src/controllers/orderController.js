const Order = require("../models/Order");
const db = require('../util/db');

module.exports = {
    addOrder: async (req, res) => {
        const { name, parcel, quantity, size, orderId } = req.body;
        if (!name || !parcel || !quantity || !size || !orderId ) {
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
            } catch (error) {
                return res.json({ success: false, message: error.message });
            }
        }
    },

    updateOrderInfo: async (req, res) => {
        const { orderId } = req.body;
        try {
            await db.orders.updateOne(
                { orderId },
                {
                    $set: {
                        ...req.body
                    }
                }
            );
            return res.json({ success: true, message: 'Order info has updated successfully.'});
        } catch (error) {
            return res.json({ success: false, message: error.message });
        }
    }
};
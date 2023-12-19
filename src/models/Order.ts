import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
    },
    parcel: {
        type: String,
        required: true,
    },
    name: {
        type: String
    },
    quantity: {
        type: Number,
        required: true
    },
    size: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const OrderModel= mongoose.model("Order", OrderSchema);
export default OrderModel

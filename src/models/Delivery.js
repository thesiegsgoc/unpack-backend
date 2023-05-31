const mongoose = require("mongoose");

// For now, it should be find to treat oderId as a
// tracking number as well. So, it should also be used
// in the DeliverySchema.
const DeliverySchema = new mongoose.Schema({
    deliveryId: {
        type: String,
        required: true,
    },
    vendorId: {
        type: String,
        required: true,
    },
    receiver: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true
    },
    phonenumber: {
        type: String
    },
    size: {
        type: String
    },
    type: {
        type: String,
        required: true
    },
    parcel: {
        type: String
    },
    pickup: {
        type: Object,
        required: true
    },
    dropoff: {
        type: Object,
        required: true,
    },
    notes: {
        type: String,
        maxLength: 255
    },
    previousHandlers: {
        type: Array
    },
    currentHandler: {
        type: String
    },
    deliveryTime: {
        type: Date
    },
    status: {
        type: Object,
        default: {
            value: 'Processing'
        }
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Delivery = mongoose.model("Delivery", DeliverySchema);

module.exports = Delivery;

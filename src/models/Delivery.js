const mongoose = require("mongoose");

// For now, it should be find to treat oderId as a
// tracking number as well. So, it should also be used
// in the DeliverySchema.
const DeliverySchema = new mongoose.Schema({
    deliveryId: {
        type: String,
    },
    receiverId: {
        type: String,
    },
    sendorId: {
        type: String,
        required: true
    },
    partnerId: {
        type: String
    },
    receiver: {
        type: String
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
        type: String
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
    pickedUpFrom: {
        type: Array
    },
    currentHandler: {
        type: Object
    },
    scheduledHandler: {
        type: String || undefined
    },
    deliveryTime: {
        type: String
    },
    deliveryDate: {
        type: String
    },
    dropOffCost: {
        type: Number
    },
    pickUpCost: {
        type: Number
    },
    deliveryCost: {
        type: Number
    },
    status: {
        type: Object,
        default: {
            value: 'In Process'
        }
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Delivery", DeliverySchema);



const mongoose = require("mongoose");

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


module.exports = mongoose.model("Order", OrderSchema);

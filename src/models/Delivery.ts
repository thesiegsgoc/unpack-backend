import mongoose from 'mongoose'

const DeliverySchema = new mongoose.Schema({
  deliveryId: {
    type: String,
  },
  receiverId: {
    type: String,
  },
  senderId: {
    type: String,
    required: true,
  },
  partnerId: {
    type: String,
  },
  receiver: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  size: {
    type: String,
  },
  type: {
    type: String,
  },
  parcel: {
    type: String,
  },
  dropoffLocation: {
    type: Object,
    required: true,
  },
  notes: {
    type: String,
    maxLength: 255,
  },
  pickupLocation: {
    type: Array,
  },
  currentHandler: {
    type: Object,
  },
  scheduledHandler: {
    type: String || undefined,
  },
  deliveryTime: {
    type: String,
  },
  deliveryDate: {
    type: String,
  },
  dropOffCost: {
    type: Object,
  },
  pickUpCost: {
    type: Object,
  },
  deliveryCost: {
    type: Number,
  },
  status: {
    type: Object,
    default: {
      value: 'In Process',
    },
  },
  orderId: {
    type: String,
  },
  vendorId: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

const DeliveryModel = mongoose.model('Delivery', DeliverySchema)
export default DeliveryModel

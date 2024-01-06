import mongoose from 'mongoose'
const DeliverySessionSchema = new mongoose.Schema({
  deliveryOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryOrder',
    required: true,
  },
  currentHandler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
  },
  status: {
    type: String,
    default: 'In Transit', // Example statuses: In Transit, Delivered, Cancelled
  },
  startTime: Date,
  endTime: Date,
})

const DeliverySession = mongoose.model('DeliverySession', DeliverySessionSchema)

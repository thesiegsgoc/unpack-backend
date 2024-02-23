import mongoose, { Schema } from 'mongoose'

const DeliverySchema = new mongoose.Schema({
  deliveryId: {
    type: String,
    required: true,
  },
  receiverId: {
    type: String,
  },
  userId: {
    type: String,
    required: true,
  },
  driverId: {
    type: String,
  },
  partnerId: {
    type: String,
  },
  receiver: {
    type: String,
  },
  delivery_quantity: {
    type: Number,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  package_size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: true, // Assuming package_size is required, adjust if it's optional
  },
  delivery_type: {
    type: String,
    enum: ['standard', 'express'],
    required: true, // Assuming delivery_type is required, adjust if it's optional
  },
  dropoffLocation: {
    type: Schema.Types.Mixed, // Adjust according to LocationData structure
    required: true,
  },
  pickupLocation: {
    type: Schema.Types.Mixed, // Adjust according to LocationData structure
    required: true,
  },
  delivery_notes: {
    type: String,
  },
  current_handler: {
    type: Schema.Types.Mixed, // Adjust to a more specific type if possible
  },
  scheduled_handler: {
    type: String,
  },
  delivery_time: {
    type: String,
  },
  delivery_date: {
    type: String,
  },
  drop_off_cost: {
    type: Number,
  },
  pick_up_cost: {
    type: Number,
  },
  delivery_cost: {
    type: Number,
    required: true,
  },
  delivery_status: {
    type: Schema.Types.Mixed, // Consider defining a specific type for status
    default: 'In Process', // Adjust default value as needed
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
  pickupZone: {
    type: Schema.Types.Mixed, // Adjust according to Zone structure
    required: true,
  },
  dropoffZone: {
    type: Schema.Types.Mixed, // Adjust according to Zone structure
    required: true,
  },
})

const DeliveryModel = mongoose.model('Delivery', DeliverySchema)
export default DeliveryModel

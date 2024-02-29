import mongoose, { Schema } from 'mongoose'

const DeliverySchema = new mongoose.Schema({
  deliveryId: {
    type: String,
    required: true,
  },
  receiver: {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  userId: {
    type: String,
    required: true,
  },
  driverId: {
    type: String,
    ref: 'Driver',
  },
  partnerId: {
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
    required: true,
  },
  delivery_type: {
    type: String,
    enum: ['standard', 'express'],
    required: true,
  },
  dropoffLocation: {
    type: Schema.Types.Mixed,
    required: true,
  },
  pickupLocation: {
    type: Schema.Types.Mixed,
    required: true,
  },
  delivery_notes: {
    type: String,
  },
  current_handler: {
    type: Schema.Types.Mixed,
  },
  scheduled_handler: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PackageHandler',
    },
  ],
  scheduled_delivery_date: {
    type: Date,
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
    type: Schema.Types.Mixed,
    default: 'ACTIVE',
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
    type: Schema.Types.Mixed,
    required: true,
  },
  dropoffZone: {
    type: Schema.Types.Mixed,
    required: true,
  },
})

const DeliveryModel = mongoose.model('Delivery', DeliverySchema)
export default DeliveryModel

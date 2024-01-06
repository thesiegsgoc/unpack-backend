import mongoose, { Schema, Document } from 'mongoose'
import { IDeliveryOrder } from '../types/delivery'

export interface IDeliveryOrderModel extends IDeliveryOrder, Document {}

export const DeliverySchema: Schema<IDeliveryOrder> = new mongoose.Schema({
  deliveryId: {
    type: String,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User or Driver model
    ref: 'User',
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User or Driver model
    ref: 'User',
  },
  scheduledDriver: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User or Driver model
    ref: 'User',
  },
  packageSize: {
    type: String,
    required: true, // Assuming 'size' is required
  },
  quantity: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
  },
  dropoffLocation: {
    type: Object, // Consider defining a more specific schema or type for locations
    required: true,
  },
  pickupLocation: {
    type: Array, // Consider a more specific type or a sub-schema for locations
  },
  currentHandler: {
    type: Object, // Consider a reference to a User or Driver model if applicable
  },
  pickupDate: {
    type: String,
  },
  deliveryDate: {
    type: String,
  },
  dropOffCost: {
    type: Object, // Consider a more specific schema or type if needed
  },
  pickUpCost: {
    type: Object, // Same as above
  },
  deliveryCost: {
    type: Number,
  },
  name: {
    type: String,
  },
  notes: {
    type: String,
    maxLength: 255,
  },
  status: {
    type: Object,
    default: {
      value: 'In Process',
    },
  },
  startTime: Date,
  endTime: Date,
})

const DeliveryModel = mongoose.model('Delivery', DeliverySchema)
export default DeliveryModel

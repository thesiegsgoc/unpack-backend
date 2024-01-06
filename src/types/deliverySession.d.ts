import mongoose, { Document } from 'mongoose'

interface ICurrentLocation {
  latitude: number
  longitude: number
}

interface IDeliverySession extends Document {
  deliveryOrder: mongoose.Types.ObjectId // Reference to DeliveryOrder model
  currentHandler?: mongoose.Types.ObjectId // Optional reference to User model
  currentLocation?: ICurrentLocation
  status: 'In Transit' | 'Delivered' | 'Cancelled' // Enum-like definition for status
  startTime?: Date
  endTime?: Date
}

export default IDeliverySession

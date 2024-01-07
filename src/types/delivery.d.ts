import mongoose from 'mongoose'

interface ILocation {
  // Define the structure for location data, if you have specific fields
  // Example:
  latitude: number
  longitude: number
}

interface ICost {
  // Define the structure for cost data, if you have specific fields
  // Example:
  amount: number
  currency: string
}

interface IDeliveryStatus {
  value: string // Represents the current status (e.g., 'In Process', 'Delivered', 'Cancelled')
  updatedAt: Date // Timestamp of when the status was last updated
  updatedBy?: mongoose.Types.ObjectId // ID of the user or system that updated the status, if applicable
  reason?: string // Reason for the status change, particularly useful for cancellations or exceptions
}

interface IDeliveryOrder {
  deliveryId?: string
  receiverId: mongoose.Types.ObjectId
  senderId: string
  driverId: string
  packageSize: string
  quantity: number
  type?: string
  parcel: string
  dropoffLocation: ILocation
  pickupLocation?: ILocation
  currentHandler?: mongoose.Types.ObjectId | IHandler // If IHandler is another interface
  pickupDate?: string
  deliveryDate?: string
  dropOffCost?: ICost
  pickUpCost?: ICost
  deliveryCost?: number
  name?: string
  notes?: string
  status?: IDeliveryStatus
  currentHandler?: mongoose.Types.ObjectId // Optional reference to User model
  currentLocation?: ICurrentLocation
  status: 'Pending' | 'Accepted' | 'In Transit' | 'Delivered' | 'Cancelled'
  startTime?: Date
  endTime?: Date
}

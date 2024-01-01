import mongoose, { Document } from 'mongoose'
import { IUserModel } from './user'

interface IDriver extends IUserModel {
  licenseInfo: {
    number: string
    expiryDate: Date
    issuingState: string
  }
  vehicleInfo: {
    make: string
    model: string
    year: number
    color: string
    licensePlate: string
    insurance: string
    registrationDocument: string
  }
  driverStatus: string
  currentLocation: string
  availability: string
  preferredDeliveryTypes: string[]
  realTimeStatusUpdates: string
  earnings: {
    rates: number
    incentives: number
    deductions: number
    paymentHistory: any[]
  }
  performance: {
    completionRate: number
    onTimeDeliveryRate: number
    customerRatings: number[]
    safetyAndComplianceIndicators: string[]
  }
}

const DriverSchema = new mongoose.Schema({
  licenseInfo: {
    number: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    issuingState: { type: String, required: true },
  },
  vehicleInfo: {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    color: { type: String, required: true },
    licensePlate: { type: String, required: true },
    insurance: { type: String, required: true },
    registrationDocument: { type: String, required: true },
  },
  driverStatus: { type: String, required: true },
  currentLocation: { type: String, required: true },
  availability: { type: String, required: true },
  preferredDeliveryTypes: [{ type: String }],
  realTimeStatusUpdates: { type: String },
  earnings: {
    rates: { type: Number },
    incentives: { type: Number },
    deductions: { type: Number },
    paymentHistory: [{ type: mongoose.Schema.Types.Mixed }],
  },
  performance: {
    completionRate: { type: Number },
    onTimeDeliveryRate: { type: Number },
    customerRatings: [{ type: Number }],
    safetyAndComplianceIndicators: [{ type: String }],
  },
})

const DriverModel = mongoose.model<IDriver>('Driver', DriverSchema)
export default DriverModel

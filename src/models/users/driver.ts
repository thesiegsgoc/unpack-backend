import UserModel from './user'
import mongoose, { Schema, Document } from 'mongoose'

export interface IDeiverModal extends IDriver, Document {}

const DriverSchema: Schema<IDeiverModal> = new mongoose.Schema({
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

DriverSchema.virtual('driverId').get(function () {
  return this.userId
})

DriverSchema.index({ currentLocation: '2dsphere' })

const DriverModel = UserModel.discriminator<IDriver>('Driver', DriverSchema)
export default DriverModel

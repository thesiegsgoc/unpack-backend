import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const DriverSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: uuidv4,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    maxLength: 100,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  status: {
    type: String,
  },
  avatar: {
    type: Buffer,
  },
  location: {
    type: Schema.Types.Mixed,
    default: {},
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {},
  },
  userType: {
    type: String,
    enum: ['normal', 'vendor', 'zoneManager', 'driver', 'agent'],
  },
  expoPushToken: Schema.Types.Mixed,
  profilePhoto: String,
  canDeliver: String,
  rating: Number,
  securityCode: String,
  securityAnswer: String,
  preferredPickupLocation: String,
  languagePreference: String,
  dateOfBirth: Date,
  emailVerified: Boolean,
  paymentMethod: Schema.Types.Mixed,
  date: {
    type: Date,
    default: Date.now,
  },
  deliveries: [Schema.Types.Mixed],

  // Driver-specific fields
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
    paymentHistory: [{ type: Schema.Types.Mixed }],
  },
  performance: {
    completionRate: { type: Number },
    onTimeDeliveryRate: { type: Number },
    customerRatings: [{ type: Number }],
    safetyAndComplianceIndicators: [{ type: String }],
  },
})

const DriverModel = mongoose.model('Driver', DriverSchema)
export default DriverModel
